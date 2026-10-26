import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../../../api/config';
import { useAuth } from '../../../../App';

interface RequiredLicense {
  idLicenseTypes: number;
  name: string;
  description: string | null;
  entrepreneurLicenseId: number | null;
  verificationStatus: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | null;
  documentUrl: string | null;
  issueDate: string | null;
  expirationDate: string | null;
  verificationNotes: string | null;
}

const statusLabel = (status: string | null) => {
  if (status === 'APROBADO') return 'Aprobado';
  if (status === 'PENDIENTE') return 'Pendiente de revisión';
  if (status === 'RECHAZADO') return 'Rechazado';
  return 'Sin subir';
};

const statusColor = (status: string | null) => {
  if (status === 'APROBADO') return 'bg-green-100 text-green-700';
  if (status === 'PENDIENTE') return 'bg-yellow-100 text-yellow-700';
  if (status === 'RECHAZADO') return 'bg-red-100 text-red-700';
  return 'bg-aurora-navy/10 text-aurora-navy/60';
};

const LegalCompliancePage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [licenses, setLicenses] = useState<RequiredLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<number, File | null>>({});

  const fetchLicenses = useCallback(async () => {
    if (!clubId) return;
    try {
      const response = await api.get(`/entrepreneur-licenses/required-for-club/${clubId}`);
      setLicenses(getResponseData(response) || []);
    } catch {
      setFetchError('No se pudieron cargar los requisitos legales de este club.');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    if (userRole !== 'entrepreneur' || !user?.managedClubId || user.managedClubId !== clubId) {
      navigate('/login');
      return;
    }
    fetchLicenses();
  }, [clubId, user, userRole, navigate, fetchLicenses]);

  const handleFileChange = (idLicenseTypes: number, file: File | null) => {
       if (file && file.size > 8 * 1024 * 1024) {
      toast.error('El archivo no puede superar los 8MB.');
      setSelectedFiles((prev) => ({ ...prev, [idLicenseTypes]: null }));
      return;
    }
    setSelectedFiles((prev) => ({ ...prev, [idLicenseTypes]: file }));
  };

  const handleUpload = async (license: RequiredLicense) => {
    const file = selectedFiles[license.idLicenseTypes];
    if (!file || !user) return;
    setUploadingId(license.idLicenseTypes);
    try {
      const formData = new FormData();
      formData.append('document', file);
      if (license.entrepreneurLicenseId) {
        await api.patch(`/entrepreneur-licenses/${license.entrepreneurLicenseId}`, formData);
      } else {
        formData.append('idEntrepreneurs', String(user.id));
        formData.append('idLicenseTypes', String(license.idLicenseTypes));
        await api.post('/entrepreneur-licenses', formData);
      }
      setSelectedFiles((prev) => ({ ...prev, [license.idLicenseTypes]: null }));
      await fetchLicenses();
      toast.success(`${license.name} subido correctamente. Queda pendiente de revisión.`);
    } catch {
      toast.error('Error al subir el archivo. Intentá de nuevo.');
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-aurora-navy/15 border-t-aurora-terracotta" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="card-surface p-4 sm:p-8">
        <h1 className="font-display text-3xl font-bold text-aurora-navy mb-2 text-center">Cumplimiento Legal</h1>
        <p className="text-aurora-navy/60 text-center mb-8">
          Subí las habilitaciones, licencias y permisos que tu club necesita según su rubro para operar de forma vigente en Argentina.
        </p>
        {fetchError && <p className="text-red-600 text-sm bg-red-50 border border-red-100 p-3 rounded-lg mb-6">{fetchError}</p>}
        {licenses.length === 0 ? (
          <p className="text-aurora-navy/50 text-center">No hay requisitos legales configurados para las categorías de tu club.</p>
        ) : (
          <div className="space-y-6">
            {licenses.map((license) => (
              <div key={license.idLicenseTypes} className="border border-aurora-navy/10 rounded-xl p-6 bg-aurora-cream">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-aurora-navy">{license.name}</h3>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor(license.verificationStatus)}`}>
                        {statusLabel(license.verificationStatus)}
                      </span>
                    </div>
                    {license.description && (
                      <p className="text-aurora-navy/60 text-sm mt-2">{license.description}</p>
                    )}
                    {license.verificationNotes && license.verificationStatus === 'RECHAZADO' && (
                      <p className="text-red-600 text-sm mt-2">Motivo del rechazo: {license.verificationNotes}</p>
                    )}
                    {license.documentUrl && (
                  <a    
                        href={license.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-aurora-terracotta hover:text-aurora-terracottaDark text-sm mt-2 inline-block font-medium"
                      >
                        Ver archivo subido
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 w-full md:w-64">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(license.idLicenseTypes, e.target.files ? e.target.files[0] : null)}
                      className="text-sm text-aurora-navy/70"
                    />
                    <button
                      onClick={() => handleUpload(license)}
                      disabled={!selectedFiles[license.idLicenseTypes] || uploadingId === license.idLicenseTypes}
                      className="btn-primary !py-2 text-sm disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {uploadingId === license.idLicenseTypes
                        ? 'Subiendo...'
                        : license.entrepreneurLicenseId
                        ? 'Reemplazar Archivo'
                        : 'Subir Archivo'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalCompliancePage;
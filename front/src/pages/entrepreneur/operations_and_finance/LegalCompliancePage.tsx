import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../api/config';
import { useAuth } from '../../../App';

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
  return 'bg-gray-100 text-gray-600';
};

const LegalCompliancePage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [licenses, setLicenses] = useState<RequiredLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<number, File | null>>({});

  const fetchLicenses = async () => {
    try {
      const response = await api.get(`/entrepreneur-licenses/required-for-club/${clubId}`);
      setLicenses(getResponseData(response) || []);
    } catch {
      setError('No se pudieron cargar los requisitos legales de este club.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userRole !== 'entrepreneur' || !user?.managedClubId || user.managedClubId !== clubId) {
      navigate('/login');
      return;
    }
    if (clubId) fetchLicenses();
  }, [clubId, user, userRole, navigate]);

  const handleFileChange = (idLicenseTypes: number, file: File | null) => {
    setSelectedFiles((prev) => ({ ...prev, [idLicenseTypes]: file }));
  };

  const handleUpload = async (license: RequiredLicense) => {
    const file = selectedFiles[license.idLicenseTypes];
    if (!file || !user) return;
    setUploadingId(license.idLicenseTypes);
    setError('');
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
    } catch {
      setError('Error al subir el archivo. Intentá de nuevo.');
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Cargando requisitos legales...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <button
        onClick={() => navigate(`/club/${clubId}`)}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
      >
        ← Volver al Perfil del Club
      </button>
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Cumplimiento Legal</h1>
        <p className="text-gray-600 text-center mb-8">
          Subí las habilitaciones, licencias y permisos que tu club necesita según su rubro para operar de forma vigente en Argentina.
        </p>
        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded mb-6">{error}</p>}
        {licenses.length === 0 ? (
          <p className="text-gray-600 text-center">No hay requisitos legales configurados para las categorías de tu club.</p>
        ) : (
          <div className="space-y-6">
            {licenses.map((license) => (
              <div key={license.idLicenseTypes} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-800">{license.name}</h3>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor(license.verificationStatus)}`}>
                        {statusLabel(license.verificationStatus)}
                      </span>
                    </div>
                    {license.description && (
                      <p className="text-gray-600 text-sm mt-2">{license.description}</p>
                    )}
                    {license.verificationNotes && license.verificationStatus === 'RECHAZADO' && (
                      <p className="text-red-600 text-sm mt-2">Motivo del rechazo: {license.verificationNotes}</p>
                    )}
                    {license.documentUrl && (
                     <a
                        href={license.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
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
                      className="text-sm"
                    />
                    <button
                      onClick={() => handleUpload(license)}
                      disabled={!selectedFiles[license.idLicenseTypes] || uploadingId === license.idLicenseTypes}
                      className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-semibold ${
                        !selectedFiles[license.idLicenseTypes] || uploadingId === license.idLicenseTypes ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
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
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../api/config';
import { useAuth } from '../../../App';

interface RequiredLicense {
  idLicenseTypes: number;
  name: string;
  description: string | null;
  entrepreneurLicenseId: number | null;
  verificationStatus: string | null;
  documentUrl: string | null;
  issueDate: string | null;
  expirationDate: string | null;
  verificationNotes: string | null;
}

const statusLabel: Record<string, string> = {
  PENDIENTE: 'Pendiente de revisión',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
};

const statusColor: Record<string, string> = {
  PENDIENTE: 'bg-yellow-100 text-yellow-700',
  APROBADO: 'bg-green-100 text-green-700',
  RECHAZADO: 'bg-red-100 text-red-700',
};

const LegalCompliancePage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [licenses, setLicenses] = useState<RequiredLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [pendingFiles, setPendingFiles] = useState<Record<number, File | null>>({});
  const [pendingDates, setPendingDates] = useState<Record<number, { issueDate: string; expirationDate: string }>>({});

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchLicenses = useCallback(async () => {
    if (!clubId) return;
    try {
      const response = await api.get(`/entrepreneur-licenses/required-for-club/${clubId}`);
      setLicenses(getResponseData(response));
    } catch (error) {
      console.error('Error fetching required licenses:', error);
      showToast('No se pudieron cargar los requisitos legales', 'error');
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
    setPendingFiles((prev) => ({ ...prev, [idLicenseTypes]: file }));
  };

  const handleDateChange = (idLicenseTypes: number, field: 'issueDate' | 'expirationDate', value: string) => {
    setPendingDates((prev) => ({
      ...prev,
      [idLicenseTypes]: { ...prev[idLicenseTypes], [field]: value },
    }));
  };

  const handleUpload = async (license: RequiredLicense) => {
    if (!user?.id) return;
    const file = pendingFiles[license.idLicenseTypes];
    if (!file) {
      showToast('Seleccioná un archivo antes de subir', 'error');
      return;
    }
    setUploadingId(license.idLicenseTypes);
    try {
      const formData = new FormData();
      formData.append('idEntrepreneurs', String(user.id));
      formData.append('idLicenseTypes', String(license.idLicenseTypes));
      const dates = pendingDates[license.idLicenseTypes];
      if (dates?.issueDate) formData.append('issueDate', dates.issueDate);
      if (dates?.expirationDate) formData.append('expirationDate', dates.expirationDate);
      formData.append('document', file);
      await api.post('/entrepreneur-licenses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Documento subido correctamente. Queda pendiente de revisión.');
      setPendingFiles((prev) => ({ ...prev, [license.idLicenseTypes]: null }));
      fetchLicenses();
    } catch (error) {
      console.error('Error uploading license:', error);
      showToast('Error al subir el documento', 'error');
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Cargando cumplimiento legal...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 max-w-sm px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}
        >
          {toast.msg}
        </div>
      )}
      <button
        onClick={() => navigate(`/club/${clubId}`)}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
      >
        ← Volver al Perfil del Club
      </button>
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">Cumplimiento Legal</h1>
        <p className="text-gray-500 text-center mb-8">
          Subí las habilitaciones, permisos y licencias correspondientes al rubro de tu club. El equipo de AuraBox las va a revisar próximamente.
        </p>
        {licenses.length === 0 ? (
          <p className="text-gray-600 text-center">
            Tu club todavía no tiene categorías asignadas, por lo que no hay requisitos legales para mostrar.
          </p>
        ) : (
          <div className="space-y-5">
            {licenses.map((license) => (
              <div key={license.idLicenseTypes} className="border border-gray-200 rounded-xl p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{license.name}</h3>
                    {license.description && (
                      <p className="text-sm text-gray-500 mt-1">{license.description}</p>
                    )}
                  </div>
                  {license.verificationStatus && (
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap ${statusColor[license.verificationStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                      {statusLabel[license.verificationStatus] ?? license.verificationStatus}
                    </span>
                  )}
                </div>
                {license.entrepreneurLicenseId ? (
                  <div className="text-sm text-gray-600 space-y-1">
                    {license.documentUrl && (
                      <p>
                        Documento:{' '}
                        <a href={license.documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Ver archivo subido
                        </a>
                      </p>
                    )}
                    {license.issueDate && <p>Fecha de emisión: {license.issueDate.split('T')[0]}</p>}
                    {license.expirationDate && <p>Fecha de vencimiento: {license.expirationDate.split('T')[0]}</p>}
                    {license.verificationNotes && <p>Notas del revisor: {license.verificationNotes}</p>}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Fecha de emisión (opcional)</label>
                        <input
                          type="date"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                          value={pendingDates[license.idLicenseTypes]?.issueDate ?? ''}
                          onChange={(e) => handleDateChange(license.idLicenseTypes, 'issueDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Fecha de vencimiento (opcional)</label>
                        <input
                          type="date"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                          value={pendingDates[license.idLicenseTypes]?.expirationDate ?? ''}
                          onChange={(e) => handleDateChange(license.idLicenseTypes, 'expirationDate', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 md:items-center">
                      <input
                        type="file"
                        accept="application/pdf,image/png,image/jpeg,image/jpg"
                        onChange={(e) => handleFileChange(license.idLicenseTypes, e.target.files?.[0] ?? null)}
                        className="text-sm"
                      />
                      <button
                        onClick={() => handleUpload(license)}
                        disabled={uploadingId === license.idLicenseTypes}
                        className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {uploadingId === license.idLicenseTypes ? 'Subiendo...' : 'Subir documento'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalCompliancePage;
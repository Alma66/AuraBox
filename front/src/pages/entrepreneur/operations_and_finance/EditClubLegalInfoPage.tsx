import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../api/config';
import { Club, LegalSection } from '../../../types/club';
import { useAuth } from '../../../App';

const EditClubLegalInfoPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [termsSections, setTermsSections] = useState<LegalSection[]>([]);
  const [policySections, setPolicySections] = useState<LegalSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchClub = async () => {
      if (userRole !== 'entrepreneur' || !user?.managedClubId || user.managedClubId !== clubId) {
        navigate('/login');
        return;
      }

      try {
        const response = await api.get(`/clubs/${clubId}`);
        const clubData = getResponseData(response);
        setClub(clubData);
        setTermsSections(clubData.legalInfo?.termsAndConditionsSections || []);
        setPolicySections(clubData.legalInfo?.privacyAndSecurityPolicySections || []);
      } catch (err) {
        console.error("Error fetching club:", err);
        setError('Club no encontrado.');
      } finally {
        setLoading(false);
      }
    };
    if (clubId) fetchClub();
  }, [clubId, user, userRole, navigate]);

  const handleSave = async () => {
    if (!club) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData = {
        legalInfo: {
          ...club.legalInfo,
          termsAndConditionsSections: termsSections,
          privacyAndSecurityPolicySections: policySections,
        },
      };

      await api.put(`/clubs/${club.id}`, updateData);
      setClub({ ...club, ...updateData });
      setSuccess('Información legal actualizada con éxito.');
    } catch (err) {
      console.error("Error saving legal info:", err);
      setError('Error al guardar la información legal.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Cargando editor...</div>;
  }

  if (error && !club) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600">{error}</div>;
  }

  if (!club) {
    return <div className="container mx-auto px-4 py-8 text-center">No se pudo cargar la información del club.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <button
        onClick={() => navigate(`/club/${clubId}`)}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
      >
        ← Volver al Perfil del Club
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          Editar Información Legal de {club.name}
        </h1>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">¡Éxito!</strong>
            <span className="block sm:inline"> {success}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-gray-700 text-lg font-bold mb-2">Términos y Condiciones</label>
          <textarea
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-96 resize-y"
            value={termsSections.map(s => (typeof s.content === 'string' ? s.content : s.content.join('\n'))).join('\n\n')}
            onChange={(e) => {
              const text = e.target.value;
              const paragraphs = text.split('\n\n').map((p, i) => ({
                id: `edited-tc-${i}`,
                type: 'paragraph' as const,
                content: p,
              }));
              setTermsSections(paragraphs);
            }}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-lg font-bold mb-2">Políticas de Seguridad y Devolución</label>
          <textarea
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-96 resize-y"
            value={policySections.map(s => (typeof s.content === 'string' ? s.content : s.content.join('\n'))).join('\n\n')}
            onChange={(e) => {
              const text = e.target.value;
              const paragraphs = text.split('\n\n').map((p, i) => ({
                id: `edited-ps-${i}`,
                type: 'paragraph' as const,
                content: p,
              }));
              setPolicySections(paragraphs);
            }}
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-200 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditClubLegalInfoPage;
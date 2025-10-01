// src/pages/entrepreneur/EditClubLegalInfoPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import clubsData from '../../../data/clubs.json';
import { Club, LegalSection } from '../../../types/club';
import { useAuth } from '../../../App';

const EditClubLegalInfoPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [termsSections, setTermsSections] = useState<LegalSection[]>([]);
  const [policySections, setPolicySections] = useState<LegalSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'entrepreneur' || user.managedClubId !== clubId) {
      navigate('/login');
      return;
    }

    const foundClub = clubsData.find(c => c.id === clubId) as Club | undefined;
    if (foundClub) {
      setClub(foundClub);
      setTermsSections(foundClub.legalInfo?.termsAndConditionsSections || []);
      setPolicySections(foundClub.legalInfo?.privacyAndSecurityPolicySections || []);
    } else {
      setError('Club no encontrado.');
    }
    setLoading(false);
  }, [clubId, user, navigate]);

  const handleSave = () => {
    if (!club) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const updatedClub: Club = {
      ...club,
      legalInfo: {
        ...club.legalInfo,
        termsAndConditionsSections: termsSections,
        privacyAndSecurityPolicySections: policySections,
      },
    };

    console.log('Simulando guardado de información legal:', updatedClub);

    setTimeout(() => {
      setClub(updatedClub);
      setSuccess('Información legal actualizada con éxito.');
      setSaving(false);
    }, 1500);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Cargando editor...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-center text-red-600">{error}</div>;
  }

  if (!club) {
    return <div className="container mx-auto px-4 py-8 text-center">No se pudo cargar la información del club.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <button
        onClick={() => navigate(`/club/${clubId}`)}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 transform hover:translate-x-1"
      >
        ← Volver al Perfil del Club
      </button>

      <div className="bg-white rounded-xl shadow-lg p-8 mb-8 animate-fadeInUp">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          Editar Información Legal de {club.name}
        </h1>

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">¡Éxito!</strong>
            <span className="block sm:inline"> {success}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-gray-700 text-lg font-bold mb-2">Términos y Condiciones (texto plano)</label>
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
          <label className="block text-gray-700 text-lg font-bold mb-2">Políticas de Seguridad y Devolución (texto plano)</label>
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
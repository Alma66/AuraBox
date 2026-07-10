import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../api/config';
import LegalContentRenderer from '../../../components/club/LegalContentRenderer';
import { LegalSection } from '../../../types/legalSection';

const PrivacyAndSecurityPolicyPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const [sections, setSections] = useState<LegalSection[]>([]);
  const [clubName, setClubName] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [legalResponse, clubResponse] = await Promise.all([
          api.get(`/club-legal-content/by-club/${clubId}`),
          api.get(`/clubs/${clubId}`),
        ]);
        setSections(getResponseData(legalResponse).privacyAndSecurityPolicy ?? []);
        setClubName(getResponseData(clubResponse).name ?? '');
      } catch (error) {
        console.error('Error fetching privacy policy:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    if (clubId) fetchContent();
  }, [clubId]);

  if (loading) {
    return <div className="text-center py-20">Cargando políticas...</div>;
  }

  if (notFound) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Club no encontrado</h1>
        <p className="text-lg text-gray-700 mb-8">No se pudieron cargar las políticas de seguridad y devolución.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
      >
        &larr; Volver al Club
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Política de Seguridad y Devolución de {clubName}</h1>
      {sections.length > 0 ? (
        <LegalContentRenderer sections={sections} />
      ) : (
        <p className="text-gray-600 text-center">
          Este club aún no ha proporcionado sus políticas de seguridad y devolución.
        </p>
      )}
    </div>
  );
};

export default PrivacyAndSecurityPolicyPage;
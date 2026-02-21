import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../api/config';
import { Club, LegalSection } from '../../../types/club';
import LegalContentRenderer from '../../../components/club/LegalContentRenderer';

const TermsAndConditionsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const response = await api.get(`/clubs/${clubId}`);
        const clubData = getResponseData(response);
        
        const legalInfo = clubData.legalInfo || {};
        const allowedTypes = ['title', 'paragraph', 'list', 'image'];

        const sanitizeSections = (sections: any[]): LegalSection[] =>
          sections.map((section: any) => ({
            id: section.id,
            type: allowedTypes.includes(section.type) ? section.type : 'paragraph',
            content: section.content,
            layout: section.layout,
          }));

        const sanitizedClub: Club = {
          ...clubData,
          legalInfo: {
            ...legalInfo,
            termsAndConditionsSections: legalInfo.termsAndConditionsSections
              ? sanitizeSections(legalInfo.termsAndConditionsSections)
              : [],
            privacyAndSecurityPolicySections: legalInfo.privacyAndSecurityPolicySections
              ? sanitizeSections(legalInfo.privacyAndSecurityPolicySections)
              : [],
          },
        };

        setClub(sanitizedClub);
      } catch (error) {
        console.error("Error fetching club:", error);
        setClub(null);
      } finally {
        setLoading(false);
      }
    };
    if (clubId) fetchClub();
  }, [clubId]);

  if (loading) {
    return <div className="text-center py-20">Cargando términos...</div>;
  }

  if (!club) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Club no encontrado</h1>
        <p className="text-lg text-gray-700 mb-8">No se pudieron cargar los términos y condiciones.</p>
        <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-blue-600 hover:text-blue-800">
        &larr; Volver al Club
      </button>

      {club.legalInfo?.termsAndConditionsSections && club.legalInfo.termsAndConditionsSections.length > 0 ? (
        <LegalContentRenderer sections={club.legalInfo.termsAndConditionsSections} />
      ) : (
        <p className="text-gray-600 text-center">Este club aún no ha proporcionado sus términos y condiciones.</p>
      )}
    </div>
  );
};

export default TermsAndConditionsPage;
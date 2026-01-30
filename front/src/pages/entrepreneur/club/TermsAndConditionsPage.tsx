import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import clubsData from '../../../data/clubs.json';
import { Club, LegalSection } from '../../../types/club';
import LegalContentRenderer from '../../../components/club/LegalContentRenderer';

const TermsAndConditionsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const [club, setClub] = useState<Club | null>(null);

  useEffect(() => {
    const foundClubRaw = clubsData.find((c) => c.id === clubId);
    if (!foundClubRaw) {
      setClub(null);
      return;
    }

    const legalInfo = foundClubRaw.legalInfo || {};
    const allowedTypes = ['title', 'paragraph', 'list', 'image'];

    const sanitizeSections = (sections: any[]): LegalSection[] =>
      sections.map((section: any) => {
        const type = allowedTypes.includes(section.type) ? section.type : 'paragraph';
        return {
          id: section.id,
          type,
          content: section.content,
          layout: section.layout,
        };
      });

    const sanitizedTerms = legalInfo.termsAndConditionsSections
      ? sanitizeSections(legalInfo.termsAndConditionsSections)
      : [];

    const sanitizedPrivacy = legalInfo.privacyAndSecurityPolicySections
      ? sanitizeSections(legalInfo.privacyAndSecurityPolicySections)
      : [];

    const sanitizedClub: Club = {
      ...foundClubRaw,
      legalInfo: {
        ...legalInfo,
        termsAndConditionsSections: sanitizedTerms,
        privacyAndSecurityPolicySections: sanitizedPrivacy,
      },
    };

    setClub(sanitizedClub);
  }, [clubId]);

  if (!club) {
    return (
      <div className="container mx-auto px-4 py-8 text-center animate-fadeIn">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Club no encontrado</h1>
        <p className="text-lg text-gray-700 mb-8">No se pudieron cargar los términos y condiciones.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md"
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
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 transform hover:translate-x-1"
      >
        &larr; Volver al Club
      </button>

      {club.legalInfo?.termsAndConditionsSections && club.legalInfo.termsAndConditionsSections.length > 0 ? (
        <LegalContentRenderer sections={club.legalInfo.termsAndConditionsSections} />
      ) : (
        <p className="text-gray-600 text-center">
          Este club aún no ha proporcionado sus términos y condiciones.
        </p>
      )}
    </div>
  );
};

export default TermsAndConditionsPage;
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import clubsData from '../../../data/clubs.json';
import { Club } from '../../../types/club';
import LegalContentRenderer from '../../../components/club/LegalContentRenderer';

const PrivacyAndSecurityPolicyPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const [club, setClub] = useState<Club | null>(null);

  useEffect(() => {
    const foundClub = clubsData.find((c) => c.id === clubId) as Club | undefined;
    setClub(foundClub || null);
  }, [clubId]);

  if (!club) {
    return (
      <div className="container mx-auto px-4 py-8 text-center animate-fadeIn">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Club no encontrado</h1>
        <p className="text-lg text-gray-700 mb-8">No se pudieron cargar las políticas de seguridad y devolución.</p>
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

      {club.legalInfo?.privacyAndSecurityPolicySections && club.legalInfo.privacyAndSecurityPolicySections.length > 0 ? (
        <LegalContentRenderer sections={club.legalInfo.privacyAndSecurityPolicySections} />
      ) : (
        <p className="text-gray-600 text-center">
          Este club aún no ha proporcionado sus políticas de seguridad y devolución.
        </p>
      )}
    </div>
  );
};

export default PrivacyAndSecurityPolicyPage;
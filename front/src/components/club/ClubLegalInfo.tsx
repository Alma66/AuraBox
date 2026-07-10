import React, { useState } from 'react';
import LegalContentModal from '../common/LegalContentModal';
import { LegalSection } from '../../types/legalSection';

interface ClubLegalInfoProps {
  termsAndConditions: LegalSection[];
  privacyAndSecurityPolicy: LegalSection[];
  clubName: string;
}

const ClubLegalInfo: React.FC<ClubLegalInfoProps> = ({ termsAndConditions, privacyAndSecurityPolicy, clubName }) => {
  const [openModal, setOpenModal] = useState<'terms' | 'privacy' | null>(null);
  const hasTerms = termsAndConditions && termsAndConditions.length > 0;
  const hasPrivacy = privacyAndSecurityPolicy && privacyAndSecurityPolicy.length > 0;

  if (!hasTerms && !hasPrivacy) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Información Legal de {clubName}</h2>
      <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
        {hasTerms && (
          <button
            onClick={() => setOpenModal('terms')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md w-full md:w-auto"
          >
            Ver Términos y Condiciones
          </button>
        )}
        {hasPrivacy && (
          <button
            onClick={() => setOpenModal('privacy')}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md w-full md:w-auto"
          >
            Ver Políticas de Seguridad y Devolución
          </button>
        )}
      </div>
      {openModal === 'terms' && (
        <LegalContentModal
          title={`Términos y Condiciones de ${clubName}`}
          sections={termsAndConditions}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === 'privacy' && (
        <LegalContentModal
          title={`Política de Seguridad y Devolución de ${clubName}`}
          sections={privacyAndSecurityPolicy}
          onClose={() => setOpenModal(null)}
        />
      )}
    </div>
  );
};

export default ClubLegalInfo;
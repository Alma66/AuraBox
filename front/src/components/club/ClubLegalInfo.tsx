import React from 'react';
import { Link } from 'react-router-dom';
import { LegalInfo } from '../../types/club';

interface ClubLegalInfoProps {
  legalInfo: LegalInfo;
  clubId: string; 
}

const ClubLegalInfo: React.FC<ClubLegalInfoProps> = ({ legalInfo, clubId }) => {
  const hasLegalInfo =
    (legalInfo.termsAndConditionsSections && legalInfo.termsAndConditionsSections.length > 0) ||
    (legalInfo.privacyAndSecurityPolicySections && legalInfo.privacyAndSecurityPolicySections.length > 0);
  if (!hasLegalInfo) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8 animate-fadeInUp">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Información Legal</h2>
      <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
        {legalInfo.termsAndConditionsSections && legalInfo.termsAndConditionsSections.length > 0 && (
          <Link
            to={`/club/${clubId}/terms-and-conditions`}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md text-center w-full md:w-auto"
          >
            Ver Términos y Condiciones
          </Link>
        )}
        {legalInfo.privacyAndSecurityPolicySections && legalInfo.privacyAndSecurityPolicySections.length > 0 && (
          <Link
            to={`/club/${clubId}/privacy-and-security`}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md text-center w-full md:w-auto"
          >
            Ver Políticas de Seguridad y Devolución
          </Link>
        )}
      </div>
    </div>
  );
};

export default ClubLegalInfo;
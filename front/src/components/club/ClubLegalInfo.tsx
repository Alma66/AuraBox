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
    <div className="rounded-3xl bg-aurora-cream p-6 text-center ring-1 ring-aurora-navy/5 md:p-10">
      <span className="section-eyebrow">Transparencia</span>
      <h2 className="mb-2 font-display text-3xl font-medium text-aurora-navy">Información legal de {clubName}</h2>
      <p className="mx-auto mb-6 max-w-xl text-sm text-aurora-navy/60">Leé las condiciones y políticas del club antes de suscribirte.</p>
      <div className="flex flex-col items-center justify-center gap-3 md:flex-row">
        {hasTerms && (
          <button onClick={() => setOpenModal('terms')} className="btn-primary w-full md:w-auto">
            Términos y condiciones
          </button>
        )}
        {hasPrivacy && (
          <button onClick={() => setOpenModal('privacy')} className="btn-outline w-full md:w-auto">
            Seguridad y devolución
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
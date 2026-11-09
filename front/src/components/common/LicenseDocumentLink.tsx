import React, { useState } from 'react';
import { openLicenseDocument } from '../../utils/licenseDocument';

interface LicenseDocumentLinkProps {
  licenseId: number;
  label: string;
}

const LicenseDocumentLink: React.FC<LicenseDocumentLinkProps> = ({ licenseId, label }) => {
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const open = async () => {
    setLoading(true);
    setFailed(false);
    try {
      await openLicenseDocument(licenseId);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <span>
      <button
        type="button"
        onClick={open}
        disabled={loading}
        className="min-h-[44px] text-aurora-terracotta underline hover:text-aurora-terracottaDark disabled:opacity-50"
      >
        {loading ? 'Abriendo...' : label}
      </button>
      {failed && (
        <span role="alert" className="ml-2 text-xs text-red-600">
          No se pudo abrir el documento
        </span>
      )}
    </span>
  );
};

export default LicenseDocumentLink;
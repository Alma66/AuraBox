import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getResponseData } from '../../api/config';

interface BannerData {
  hasClub: boolean;
  club?: { clubStatus: string };
  statusReason?: string | null;
  summary?: {
    missing: number;
    pending: number;
    rejected: number;
    expired: number;
    expiringSoon: number;
  };
}

interface BannerMessage {
  tone: string;
  text: string;
}

const buildMessage = (data: BannerData): BannerMessage | null => {
  if (!data.hasClub || !data.club) return null;
  const status = data.club.clubStatus;
  const summary = data.summary;

  if (status === 'SUSPENDIDO') {
    return {
      tone: 'border-red-200 bg-red-50 text-red-800',
      text: `Tu club está suspendido.${data.statusReason ? ` Motivo: ${data.statusReason}.` : ''}`,
    };
  }
  if (status === 'INACTIVO') {
    return {
      tone: 'border-red-200 bg-red-50 text-red-800',
      text: `Tu club está inactivo.${data.statusReason ? ` Motivo: ${data.statusReason}.` : ''}`,
    };
  }
  if (summary && (summary.rejected > 0 || summary.expired > 0)) {
    const count = summary.rejected + summary.expired;
    return {
      tone: 'border-red-200 bg-red-50 text-red-800',
      text: `Tenés ${count} ${count === 1 ? 'matrícula rechazada o vencida' : 'matrículas rechazadas o vencidas'} que hay que corregir.`,
    };
  }
  if (status === 'PENDIENTE_APROBACION') {
    if (summary && summary.missing > 0) {
      return {
        tone: 'border-yellow-200 bg-yellow-50 text-yellow-800',
        text: `Tu club está pendiente de aprobación. Faltan ${summary.missing} ${summary.missing === 1 ? 'matrícula' : 'matrículas'} por presentar.`,
      };
    }
    return {
      tone: 'border-yellow-200 bg-yellow-50 text-yellow-800',
      text: 'Tu club está pendiente de aprobación. Te avisamos acá cuando un administrador lo revise.',
    };
  }
  if (summary && summary.expiringSoon > 0) {
    return {
      tone: 'border-yellow-200 bg-yellow-50 text-yellow-800',
      text: `${summary.expiringSoon} ${summary.expiringSoon === 1 ? 'matrícula vence' : 'matrículas vencen'} en los próximos 30 días.`,
    };
  }
  return null;
};

const ComplianceBanner: React.FC<{ to?: string }> = ({ to }) => {
  const [message, setMessage] = useState<BannerMessage | null>(null);

  useEffect(() => {
    let active = true;
    api
      .get('/entrepreneur-licenses/my-compliance')
      .then((response) => {
        if (active) setMessage(buildMessage(getResponseData(response) as BannerData));
      })
      .catch(() => {
        if (active) setMessage(null);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!message) return null;

    return (
    <div role="status" className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${message.tone}`}>
      <p>{message.text}</p>
      {to && (
        <Link to={to} className="font-semibold underline">
          Ver detalle
        </Link>
      )}
    </div>
  );
};

export default ComplianceBanner;
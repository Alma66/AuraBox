import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { getResponseData } from '../../api/config';
import { isNativeApp } from '../../utils/native';
import { notifyNotificationsChanged } from '../../utils/notifications';

type Outcome = 'checking' | 'approved' | 'pending' | 'rejected' | 'error';

interface ConfirmResponse {
  ref: string | null;
  status: 'approved' | 'pending' | 'rejected' | 'unknown';
}

const POLL_MS = 4000;
const MAX_POLLS = 8;

const CONTENT: Record<Exclude<Outcome, 'checking'>, { title: string; text: string; tone: string }> = {
  approved: {
    title: '¡Pago aprobado!',
    text: 'Mercado Pago confirmó tu pago y tu suscripción ya está activa. Podés seguir el estado desde tu cuenta.',
    tone: 'bg-green-100 text-green-700',
  },
  pending: {
    title: 'Estamos esperando la confirmación',
    text: 'Tu pago todavía no fue acreditado. Apenas Mercado Pago lo confirme, tu suscripción se activa sola y te avisamos con una notificación.',
    tone: 'bg-aurora-gold/30 text-aurora-navyDark',
  },
  rejected: {
    title: 'No pudimos completar el pago',
    text: 'Mercado Pago no aprobó el pago y no se te cobró nada. Podés volver a elegir tu plan e intentar con otro medio de pago.',
    tone: 'bg-red-100 text-red-700',
  },
  error: {
    title: 'No pudimos verificar tu pago',
    text: 'Si te descontaron el dinero, no te preocupes: tu suscripción se activa sola cuando Mercado Pago lo confirme. Revisá tus notificaciones en unos minutos.',
    tone: 'bg-aurora-gold/30 text-aurora-navyDark',
  },
};

const CheckoutResultPage: React.FC = () => {
  const [params] = useSearchParams();
  const [outcome, setOutcome] = useState<Outcome>('checking');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const ref = params.get('external_reference') || '';
    const returned = params.get('status') || params.get('collection_status') || '';
    let cancelled = false;

    const finish = (value: Outcome) => {
      if (cancelled) return;
      setOutcome(value);
      notifyNotificationsChanged();
    };

    const poll = async (reference: string, attempt: number): Promise<void> => {
      if (cancelled) return;
      try {
        const res = await api.get(`/mercadopago/status/${encodeURIComponent(reference)}`);
        const data = getResponseData(res) as { status?: string } | undefined;
        if (data?.status === 'approved') return finish('approved');
        if (data?.status === 'rejected') return finish('rejected');
      } catch {
        return finish('error');
      }
      if (attempt >= MAX_POLLS) return finish('pending');
      window.setTimeout(() => poll(reference, attempt + 1), POLL_MS);
    };

    const run = async () => {
      if (!/^[A-Za-z0-9_-]{1,64}$/.test(ref)) return finish(returned === 'failure' ? 'rejected' : 'error');
      try {
        const res = await api.post('/mercadopago/confirm', { ref });
        const data = getResponseData(res) as ConfirmResponse | undefined;
        if (data?.status === 'approved') return finish('approved');
        if (data?.status === 'rejected') return finish('rejected');
        return poll(ref, 1);
      } catch {
        return finish(returned === 'failure' ? 'rejected' : 'error');
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [params]);

  if (outcome === 'checking') {
    return (
      <div className="min-h-screen bg-aurora-cream px-4 py-16">
        <div role="status" aria-live="polite" className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-aurora-terracotta" />
          <p className="font-display text-lg font-bold text-aurora-navy">Verificando tu pago…</p>
          <p className="mt-1 text-sm text-aurora-navy/70">Esto tarda unos segundos. No cierres esta página.</p>
        </div>
      </div>
    );
  }

  const content = CONTENT[outcome];

  return (
    <div className="min-h-screen bg-aurora-cream px-4 py-12">
      <div className="mx-auto max-w-md text-center">
        <div className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full ${content.tone}`}>
          <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
            {outcome === 'approved' ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            ) : outcome === 'rejected' ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
        </div>
        <h1 className="font-display text-3xl font-bold text-aurora-navy">{content.title}</h1>
        <p className="mx-auto mt-3 text-aurora-navy/75">{content.text}</p>
        {isNativeApp() ? null : (
          <p className="mt-2 text-xs text-aurora-navy/50">Si abriste el pago desde la app de AuraBox, ya podés volver a ella.</p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/customer/subscriptions"
            className="rounded-full bg-aurora-terracotta px-6 py-3 font-semibold text-white transition-colors hover:bg-aurora-terracotta/90"
          >
            Ver mis suscripciones
          </Link>
          <Link
            to={outcome === 'rejected' ? '/explore' : '/'}
            className="rounded-full border border-aurora-navy/20 px-6 py-3 font-semibold text-aurora-navy transition-colors hover:bg-white"
          >
            {outcome === 'rejected' ? 'Explorar clubes' : 'Ir al inicio'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutResultPage;
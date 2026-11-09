import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../api/config';
import { useAuth } from '../../App';

interface PendingRule {
  id: number;
  title: string;
  content: string;
  version: string;
  ruleType: string;
  publicationDate: string;
}

const PendingTermsGate: React.FC = () => {
  const { user, userRole, isAuthenticated, loading, logout } = useAuth();
  const [rules, setRules] = useState<PendingRule[]>([]);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const eligible =
      !loading && isAuthenticated && !!user && (userRole === 'customer' || userRole === 'entrepreneur');
    if (!eligible) {
      setRules([]);
      setChecked({});
      return undefined;
    }
    let cancelled = false;
    api
      .get('/platform-rules/pending')
      .then((response) => {
        if (!cancelled) setRules(getResponseData(response) || []);
      })
      .catch(() => {
        if (!cancelled) setRules([]);
      });
    return () => {
      cancelled = true;
    };
  }, [loading, isAuthenticated, user, userRole]);

  useEffect(() => {
    if (rules.length === 0) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    headingRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [rules.length]);

  if (rules.length === 0) return null;

  const allChecked = rules.every((rule) => checked[rule.id]);

  const accept = async () => {
    if (!allChecked || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await api.post('/platform-rules/accept', { ruleIds: rules.map((rule) => rule.id) });
      const remaining: PendingRule[] = getResponseData(response) || [];
      setRules(remaining);
      setChecked({});
      if (remaining.length === 0) toast.success('¡Gracias! Registramos tu aceptación.');
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(
        Array.isArray(message)
          ? message.join(', ')
          : (message ?? 'No pudimos registrar tu aceptación. Intentá de nuevo.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-aurora-navy/70 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-gate-title"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl"
      >
        <div className="border-b border-aurora-navy/10 px-6 py-5">
          <h2
            id="terms-gate-title"
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-2xl font-bold text-aurora-navy focus:outline-none"
          >
            Actualizamos nuestros términos
          </h2>
          <p className="mt-1 text-sm text-aurora-navy/70">
            Para seguir usando AuraBox, leé y aceptá {rules.length === 1 ? 'el siguiente documento' : 'los siguientes documentos'}.
          </p>
        </div>

        <div className="space-y-6 overflow-y-auto px-6 py-5">
          {rules.map((rule) => (
            <section key={rule.id}>
              <h3 className="font-semibold text-aurora-navy">{rule.title}</h3>
              <p className="mb-2 text-xs text-aurora-navy/50">
                Versión {rule.version} · Vigente desde {new Date(rule.publicationDate).toLocaleDateString('es-AR')}
              </p>
              <div
                tabIndex={0}
                className="max-h-48 overflow-y-auto whitespace-pre-line rounded-xl border border-aurora-navy/10 bg-aurora-cream p-4 text-sm leading-relaxed text-aurora-navy/80"
              >
                {rule.content}
              </div>
              <label
                htmlFor={`terms-rule-${rule.id}`}
                className="mt-3 flex min-h-[44px] cursor-pointer items-center gap-3"
              >
                <input
                  id={`terms-rule-${rule.id}`}
                  type="checkbox"
                  checked={!!checked[rule.id]}
                  onChange={(e) => setChecked((prev) => ({ ...prev, [rule.id]: e.target.checked }))}
                  className="h-4 w-4 accent-aurora-terracotta"
                />
                <span className="text-sm text-aurora-navy">Leí y acepto: {rule.title}</span>
              </label>
            </section>
          ))}
          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-aurora-navy/10 px-6 py-4 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={logout}
            disabled={submitting}
            className="min-h-[48px] rounded-xl border border-aurora-navy/20 px-6 py-3 font-semibold text-aurora-navy hover:bg-aurora-cream disabled:opacity-50"
          >
            Cerrar sesión
          </button>
          <button
            type="button"
            onClick={accept}
            disabled={!allChecked || submitting}
            className="min-h-[48px] rounded-xl bg-aurora-terracotta px-6 py-3 font-semibold text-white transition-colors hover:bg-aurora-terracottaDark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : 'Aceptar y continuar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingTermsGate;
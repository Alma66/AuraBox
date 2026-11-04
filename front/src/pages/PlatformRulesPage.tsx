import React, { useEffect, useState } from 'react';
import api, { getResponseData } from '../api/config';

interface PublicRule {
  id: number;
  title: string;
  content: string;
  version: string;
  ruleType: string;
  publicationDate: string;
}

const PlatformRulesPage: React.FC = () => {
  const [rules, setRules] = useState<PublicRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/platform-rules/active')
      .then((response) => setRules(getResponseData(response) || []))
      .catch(() => setError('No se pudieron cargar los términos.'))
      .finally(() => setLoading(false));
  }, []);
  
    useEffect(() => {
    if (loading || !window.location.hash) return;
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-aurora-cream py-16 text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-aurora-terracottaDark" />
        <p className="text-aurora-navy/70">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aurora-cream px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 font-display text-3xl font-bold text-aurora-navy">Términos y reglas de AuraBox</h1>
        <p className="mb-8 text-aurora-navy/70">Lo que tenés que saber para usar la plataforma.</p>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">{error}</div>
        )}

        {!error && rules.length === 0 && (
          <div className="rounded-2xl bg-white py-10 text-center text-sm text-aurora-navy/60 shadow-sm">
            Todavía no hay documentos publicados.
          </div>
        )}

        {rules.length > 1 && (
          <nav aria-label="Índice" className="mb-8 flex flex-wrap gap-2">
            {rules.map((rule) => (
              <a
                key={rule.id}
                href={`#rule-${rule.id}`}
                className="rounded-full border border-aurora-navy/10 bg-white px-4 py-2 text-sm font-semibold text-aurora-navy/70 hover:bg-aurora-cream"
              >
                {rule.ruleType}
              </a>
            ))}
          </nav>
        )}

        <div className="space-y-6">
          {rules.map((rule) => (
            <article key={rule.id} id={`rule-${rule.id}`} className="scroll-mt-24 rounded-2xl bg-white p-6 shadow-sm md:p-8">
              <h2 className="font-display text-xl font-bold text-aurora-navy">{rule.title}</h2>
              <p className="mb-4 text-xs text-aurora-navy/50">
                Versión {rule.version} · Vigente desde {new Date(rule.publicationDate).toLocaleDateString('es-AR')}
              </p>
              <div className="whitespace-pre-line text-sm leading-relaxed text-aurora-navy/80">{rule.content}</div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlatformRulesPage;
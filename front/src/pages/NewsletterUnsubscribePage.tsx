import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/config';

type Status = 'loading' | 'done' | 'invalid';

const NewsletterUnsubscribePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<Status>(token ? 'loading' : 'invalid');

  useEffect(() => {
    if (!token) return;
    let active = true;
    api
      .post('/newsletter/unsubscribe', { token })
      .then(() => {
        if (active) setStatus('done');
      })
      .catch(() => {
        if (active) setStatus('invalid');
      });
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-aurora-navy/10 bg-white p-8 text-center shadow-aurora-sm">
        {status === 'loading' && (
          <div role="status">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-aurora-terracottaDark" />
            <p className="text-aurora-navy/70">Procesando tu baja...</p>
          </div>
        )}
        {status === 'done' && (
          <div role="status">
            <h1 className="mb-2 font-display text-2xl font-bold text-aurora-navy">Listo, te diste de baja</h1>
            <p className="text-aurora-navy/70">No vas a recibir más novedades de AuraBox en este correo.</p>
          </div>
        )}
        {status === 'invalid' && (
          <div role="alert">
            <h1 className="mb-2 font-display text-2xl font-bold text-aurora-navy">Enlace no válido</h1>
            <p className="text-aurora-navy/70">
              El enlace de baja no es válido o ya venció. Si querés ayuda, escribinos desde Contacto.
            </p>
          </div>
        )}
        <Link
          to="/"
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-aurora-terracotta px-5 text-sm font-semibold text-white transition-colors hover:bg-aurora-terracottaDark"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NewsletterUnsubscribePage;
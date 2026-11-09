import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/config';

const AREAS = [
  'Tecnología',
  'Diseño',
  'Marketing y comunicación',
  'Atención al cliente',
  'Logística y operaciones',
  'Administración y finanzas',
  'Legal y cumplimiento',
  'Otra',
];

const MESSAGE_MIN = 20;
const MESSAGE_MAX = 2000;

const extractMessage = (err: any): string => {
  const message = err.response?.data?.message;
  if (Array.isArray(message)) return 'Revisá los datos: algún campo no es válido.';
  return message || 'No pudimos enviar tu postulación. Intentá de nuevo en un rato.';
};

const JobApplicationPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setError('');

    if (!area) {
      setError('Elegí el área que más te interesa.');
      return;
    }
    if (message.trim().length < MESSAGE_MIN) {
      setError(`Contanos un poco más sobre vos (mínimo ${MESSAGE_MIN} caracteres).`);
      return;
    }

    setStatus('sending');
    try {
      await api.post('/inbound/job-application', {
        fullName,
        email,
        phone: phone.trim() || undefined,
        area,
        profileUrl: profileUrl.trim() || undefined,
        message,
        website,
      });
      setStatus('sent');
    } catch (err: any) {
      setError(extractMessage(err));
      setStatus('idle');
    }
  };

  if (status === 'sent') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-aurora-cream py-12 px-4">
        <div role="status" className="max-w-md w-full space-y-4 p-10 card-surface shadow-aurora text-center animate-fadeInUp">
          <span className="section-eyebrow block">¡Gracias!</span>
          <h1 className="font-display text-3xl font-bold text-aurora-navy">Recibimos tu postulación</h1>
          <p className="text-sm text-aurora-navy/60">
            Te enviamos una confirmación a tu correo. Si tu perfil encaja con lo que buscamos, el equipo se va a comunicar con vos.
          </p>
          <Link to="/" className="btn-primary inline-flex w-full justify-center">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-aurora-cream py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute -top-32 -left-20 w-96 h-96 bg-aurora-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl mx-auto relative animate-fadeInUp">
        <Link to="/work-with-us" className="inline-flex items-center text-sm font-semibold text-aurora-navy/60 hover:text-aurora-terracotta mb-6 transition-colors">
          <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </Link>

        <div className="card-surface shadow-aurora p-8 sm:p-10">
          <span className="section-eyebrow block">Trabajá en AuraBox</span>
          <h1 className="font-display text-3xl font-bold text-aurora-navy mb-2">Contanos quién sos</h1>
          <p className="text-sm text-aurora-navy/60 mb-6">
            Este formulario es para sumarte al equipo de la empresa. Si tenés un club propio y querés publicarlo,{' '}
            <Link to="/register/entrepreneur" className="font-semibold text-aurora-terracotta hover:text-aurora-terracottaDark">
              registrate como emprendedor
            </Link>
            .
          </p>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate={false}>
            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
              <label htmlFor="job-website">No completar</label>
              <input id="job-website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>

            <div>
              <label htmlFor="job-name" className="block text-sm font-medium text-aurora-navy/70 mb-1">
                Nombre completo <span className="text-aurora-terracotta">*</span>
              </label>
              <input id="job-name" type="text" required minLength={2} maxLength={100} autoComplete="name" className="input-aurora" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div>
              <label htmlFor="job-email" className="block text-sm font-medium text-aurora-navy/70 mb-1">
                Email <span className="text-aurora-terracotta">*</span>
              </label>
              <input id="job-email" type="email" required maxLength={120} autoComplete="email" className="input-aurora" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="job-phone" className="block text-sm font-medium text-aurora-navy/70 mb-1">Teléfono (opcional)</label>
                <input id="job-phone" type="tel" maxLength={20} autoComplete="tel" className="input-aurora" placeholder="11 1234-5678" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label htmlFor="job-area" className="block text-sm font-medium text-aurora-navy/70 mb-1">
                  Área de interés <span className="text-aurora-terracotta">*</span>
                </label>
                <select id="job-area" required className="input-aurora" value={area} onChange={(e) => setArea(e.target.value)}>
                  <option value="">Elegí una</option>
                  {AREAS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="job-profile" className="block text-sm font-medium text-aurora-navy/70 mb-1">
                LinkedIn, portfolio o CV online (opcional)
              </label>
              <input id="job-profile" type="url" maxLength={300} className="input-aurora" placeholder="https://" value={profileUrl} onChange={(e) => setProfileUrl(e.target.value)} />
            </div>

            <div>
              <label htmlFor="job-message" className="block text-sm font-medium text-aurora-navy/70 mb-1">
                Contanos sobre vos <span className="text-aurora-terracotta">*</span>
              </label>
              <textarea id="job-message" required rows={6} maxLength={MESSAGE_MAX} className="input-aurora resize-none" placeholder="Tu experiencia, qué te gustaría hacer en AuraBox y por qué." value={message} onChange={(e) => setMessage(e.target.value)} />
              <p className={`mt-1 text-right text-xs ${message.trim().length < MESSAGE_MIN ? 'text-aurora-navy/40' : 'text-aurora-navy/60'}`}>
                {message.length}/{MESSAGE_MAX}
              </p>
            </div>

            {error && (
              <p role="alert" className="text-red-600 text-sm text-center bg-red-50 border border-red-100 rounded-lg py-2 px-3">
                {error}
              </p>
            )}

            <button type="submit" disabled={status === 'sending'} className="btn-primary w-full disabled:opacity-50">
              {status === 'sending' ? 'Enviando...' : 'Enviar postulación'}
            </button>
            <p className="text-xs text-center text-aurora-navy/40">
              Usamos tus datos solo para evaluar tu postulación.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationPage;
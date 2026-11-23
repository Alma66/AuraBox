import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/config';
import { useAuth } from '../App';
import { userFromToken } from '../utils/session';
import AuthLayout from '../components/common/AuthLayout';

const extractMessage = (err: any, fallback: string): string => {
  const message = err.response?.data?.message;
  if (Array.isArray(message)) return message.join('. ');
  return message || fallback;
};

const CompleteClubPage: React.FC = () => {
  const [clubName, setClubName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [slogan, setSlogan] = useState('');
  const [whatsappContact, setWhatsappContact] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, userRole, login } = useAuth();

  const sessionMode = isAuthenticated && userRole === 'entrepreneur' && !user?.managedClubId;
  const hasPendingToken = !!localStorage.getItem('pending_entrepreneur_token');

  useEffect(() => {
    if (done || sessionMode || hasPendingToken) return;
    if (isAuthenticated && userRole === 'entrepreneur') {
      navigate('/entrepreneur/dashboard', { replace: true });
      return;
    }
    navigate('/register/entrepreneur', { replace: true });
  }, [done, sessionMode, hasPendingToken, isAuthenticated, userRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      name: clubName.trim(),
      shortDescription: shortDescription.trim(),
      contactEmail: contactEmail.trim(),
      slogan: slogan.trim() || null,
      whatsappContact: whatsappContact.trim() || null,
    };

    try {
      if (sessionMode) {
        const response = await api.post('/auth/entrepreneur/club', payload);
        const data = response.data?.data ?? response.data;
        localStorage.setItem('access_token', data.access_token);
        await login(userFromToken(data.access_token));
        navigate('/entrepreneur/dashboard', { replace: true });
        return;
      }

      await api.post('/auth/register/entrepreneur/club', {
        ...payload,
        entrepreneurToken: localStorage.getItem('pending_entrepreneur_token'),
      });
      localStorage.removeItem('pending_entrepreneur_token');
      setDone(true);
    } catch (err: any) {
      setError(extractMessage(err, 'Error al crear el club. Intentá de nuevo.'));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthLayout
        panelEyebrow="Tu club está en camino"
        panelTitle="Gracias por sumarte a AuraBox"
        panelText="Nuestro equipo revisa cada club antes de publicarlo para cuidar a la comunidad."
        points={[
          'Ya podés iniciar sesión y configurar tu club',
          'Cargá planes, fotos y redes desde tu panel',
          'Cuando lo aprueben, vas a poder publicarlo',
        ]}
      >
        <div className="space-y-4 rounded-3xl bg-white p-8 text-center shadow-aurora ring-1 ring-aurora-navy/5 sm:p-10" role="status">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-aurora-terracotta/15 text-aurora-terracotta">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <h1 className="font-display text-4xl font-medium text-aurora-navy">Tu club está en revisión</h1>
          <p className="text-sm text-aurora-navy/60">
            El equipo de AuraBox va a revisar tu club y, cuando lo apruebe, vas a poder publicarlo. Mientras tanto ya podés
            iniciar sesión y empezar a configurarlo.
          </p>
          <Link to="/login" className="btn-primary btn-shine inline-flex w-full justify-center">
            Iniciar sesión
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      panelEyebrow={sessionMode ? 'Te falta un paso' : 'Último paso'}
      panelTitle="Contanos de tu emprendimiento"
      panelText="Con unos pocos datos creamos tu club. El resto lo completás con calma desde tu panel."
      points={[
        'Nombre, descripción y email de contacto alcanzan para empezar',
        'Nuestro equipo revisa tu club antes de publicarlo',
        'Después sumás planes, fotos y redes sociales',
      ]}
    >
      <div className="space-y-6 rounded-3xl bg-white p-8 shadow-aurora ring-1 ring-aurora-navy/5 sm:p-10">
        <div>
          <img src="/aurabox-mark.svg" alt="AuraBox" className="mb-5 h-12 w-12 rounded-xl lg:hidden" />
          <span className="section-eyebrow">{sessionMode ? 'Te falta un paso' : 'Último paso'}</span>
          <h1 className="font-display text-4xl font-medium text-aurora-navy">Registrá tu club</h1>
          <p className="mt-2 text-sm text-aurora-navy/60">
            {sessionMode
              ? 'Tu cuenta ya está creada, pero todavía no tenés un club. Completá estos datos para acceder a tu panel.'
              : 'Contanos sobre tu emprendimiento. Después vas a poder completar el resto desde tu panel.'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="club-name" className="mb-1 block text-xs font-medium text-aurora-navy/70">Nombre del club <span className="text-aurora-terracotta">*</span></label>
            <input id="club-name" type="text" required className="input-aurora" placeholder="Ej: Manjar Literario" value={clubName} onChange={(e) => setClubName(e.target.value)} />
          </div>

          <div>
            <label htmlFor="short-description" className="mb-1 block text-xs font-medium text-aurora-navy/70">Descripción corta <span className="text-aurora-terracotta">*</span></label>
            <textarea id="short-description" required rows={3} className="input-aurora resize-none" placeholder="Describí tu club en pocas palabras" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
          </div>

          <div>
            <label htmlFor="contact-email" className="mb-1 block text-xs font-medium text-aurora-navy/70">Email de contacto del club <span className="text-aurora-terracotta">*</span></label>
            <input id="contact-email" type="email" required className="input-aurora" placeholder="contacto@tuclub.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>

          <div>
            <label htmlFor="slogan" className="mb-1 block text-xs font-medium text-aurora-navy/70">Slogan (opcional)</label>
            <input id="slogan" type="text" className="input-aurora" placeholder="Ej: Cada mes, una nueva aventura" value={slogan} onChange={(e) => setSlogan(e.target.value)} />
          </div>

          <div>
            <label htmlFor="whatsapp" className="mb-1 block text-xs font-medium text-aurora-navy/70">WhatsApp de contacto (opcional)</label>
            <input id="whatsapp" type="tel" className="input-aurora" placeholder="+54 11 1234-5678" value={whatsappContact} onChange={(e) => setWhatsappContact(e.target.value)} />
          </div>

          {error && <p role="alert" className="text-red-600 text-sm text-center bg-red-50 border border-red-100 rounded-lg py-2 px-3">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary btn-shine w-full disabled:opacity-60">
            {loading ? 'Creando club...' : 'Crear mi club'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default CompleteClubPage;
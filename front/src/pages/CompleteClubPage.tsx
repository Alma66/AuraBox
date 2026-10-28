import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/config';

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

  useEffect(() => {
    if (!done && !localStorage.getItem('pending_entrepreneur_token')) {
      navigate('/register?role=entrepreneur');
    }
  }, [navigate, done]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register/entrepreneur/club', {
        entrepreneurToken: localStorage.getItem('pending_entrepreneur_token'),
        name: clubName.trim(),
        shortDescription: shortDescription.trim(),
        contactEmail: contactEmail.trim(),
        slogan: slogan.trim() || null,
        whatsappContact: whatsappContact.trim() || null,
      });
      localStorage.removeItem('pending_entrepreneur_token');
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el club. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-aurora-cream py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-4 p-10 card-surface shadow-aurora text-center animate-fadeInUp" role="status">
          <span className="section-eyebrow block">¡Listo!</span>
          <h2 className="font-display text-3xl font-bold text-aurora-navy">Tu club está en revisión</h2>
          <p className="text-sm text-aurora-navy/60">
            El equipo de AuraBox va a revisar tu club y, cuando lo apruebe, vas a poder publicarlo. Mientras tanto ya podés
            iniciar sesión y empezar a configurarlo.
          </p>
          <Link to="/login" className="btn-primary inline-flex w-full justify-center">
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-aurora-cream py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute -top-32 -left-20 w-96 h-96 bg-aurora-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 p-10 card-surface shadow-aurora relative animate-fadeInUp">
        <div>
          <span className="section-eyebrow block text-center">Último paso</span>
          <h2 className="text-center font-display text-3xl font-bold text-aurora-navy">Registrá tu club</h2>
          <p className="mt-2 text-center text-sm text-aurora-navy/60">
            Contanos sobre tu emprendimiento. Después vas a poder completar el resto desde tu panel.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="club-name" className="block text-sm font-medium text-aurora-navy/70 mb-1">Nombre del club <span className="text-aurora-terracotta">*</span></label>
            <input id="club-name" type="text" required className="input-aurora" placeholder="Ej: Manjar Literario" value={clubName} onChange={(e) => setClubName(e.target.value)} />
          </div>

          <div>
            <label htmlFor="short-description" className="block text-sm font-medium text-aurora-navy/70 mb-1">Descripción corta <span className="text-aurora-terracotta">*</span></label>
            <textarea id="short-description" required rows={3} className="input-aurora resize-none" placeholder="Describí tu club en pocas palabras" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
          </div>

          <div>
            <label htmlFor="contact-email" className="block text-sm font-medium text-aurora-navy/70 mb-1">Email de contacto del club <span className="text-aurora-terracotta">*</span></label>
            <input id="contact-email" type="email" required className="input-aurora" placeholder="contacto@tuclub.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>

          <div>
            <label htmlFor="slogan" className="block text-sm font-medium text-aurora-navy/70 mb-1">Slogan (opcional)</label>
            <input id="slogan" type="text" className="input-aurora" placeholder="Ej: Cada mes, una nueva aventura" value={slogan} onChange={(e) => setSlogan(e.target.value)} />
          </div>

          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-aurora-navy/70 mb-1">WhatsApp de contacto (opcional)</label>
            <input id="whatsapp" type="tel" className="input-aurora" placeholder="+54 11 1234-5678" value={whatsappContact} onChange={(e) => setWhatsappContact(e.target.value)} />
          </div>

          {error && <p role="alert" className="text-red-600 text-sm text-center bg-red-50 border border-red-100 rounded-lg py-2 px-3">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creando club...' : 'Crear mi club'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteClubPage;
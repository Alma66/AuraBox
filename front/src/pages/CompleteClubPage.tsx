import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';

const PROVINCES = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba',
  'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan',
  'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero',
  'Tierra del Fuego', 'Tucumán',
];

const CompleteClubPage: React.FC = () => {
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [clubName, setClubName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [slogan, setSlogan] = useState('');
  const [whatsappContact, setWhatsappContact] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('pending_user_id');
    const userType = localStorage.getItem('pending_user_type');
    if (!userId || userType !== 'entrepreneur') {
      navigate('/register');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const entrepreneurId = localStorage.getItem('pending_user_id');

    try {
      if (city || province) {
        await api.patch(`/entrepreneurs/${entrepreneurId}`, { city: city || null, province: province || null });
      }

      await api.post('/auth/register/entrepreneur/club', {
        entrepreneurId,
        name: clubName,
        shortDescription,
        contactEmail,
        slogan: slogan || null,
        whatsappContact: whatsappContact || null,
        logoUrl: '',
      });

      localStorage.removeItem('pending_user_id');
      localStorage.removeItem('pending_user_type');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el club. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    localStorage.removeItem('pending_user_id');
    localStorage.removeItem('pending_user_type');
    navigate('/login');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-aurora-cream py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute -top-32 -left-20 w-96 h-96 bg-aurora-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 p-10 card-surface shadow-aurora relative animate-fadeInUp">
        <div>
          <span className="section-eyebrow block text-center">Último paso</span>
          <h2 className="text-center font-display text-3xl font-bold text-aurora-navy">Registrá tu club</h2>
          <p className="mt-2 text-center text-sm text-aurora-navy/60">
            Contanos sobre tu emprendimiento. Podés completar los detalles ahora o terminar de configurarlo desde tu perfil.
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
            <input id="whatsapp" type="text" className="input-aurora" placeholder="+54 11 1234-5678" value={whatsappContact} onChange={(e) => setWhatsappContact(e.target.value)} />
          </div>

          <hr className="border-aurora-navy/10" />

          <p className="text-sm font-medium text-aurora-navy/70">Tu ubicación (opcional)</p>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-aurora-navy/70 mb-1">Ciudad</label>
            <input id="city" type="text" className="input-aurora" placeholder="Ej: Buenos Aires" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>

          <div>
            <label htmlFor="province" className="block text-sm font-medium text-aurora-navy/70 mb-1">Provincia</label>
            <select id="province" className="input-aurora" value={province} onChange={(e) => setProvince(e.target.value)}>
              <option value="">Seleccioná una provincia</option>
              {PROVINCES.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
          </div>

          {error && <p className="text-red-600 text-sm text-center bg-red-50 border border-red-100 rounded-lg py-2 px-3">{error}</p>}

          <div className="flex flex-col space-y-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creando club...' : 'Crear mi club'}
            </button>
            <button type="button" onClick={handleSkip} className="btn-outline w-full">
              Completar más tarde
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteClubPage;
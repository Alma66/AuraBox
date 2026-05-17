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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 p-10 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Registrá tu club</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Contanos sobre tu emprendimiento. Podés completar los detalles ahora o terminar de configurarlo desde tu perfil.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="club-name" className="block text-sm font-medium text-gray-700 mb-1">Nombre del club <span className="text-red-500">*</span></label>
            <input id="club-name" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ej: Manjar Literario" value={clubName} onChange={(e) => setClubName(e.target.value)} />
          </div>

          <div>
            <label htmlFor="short-description" className="block text-sm font-medium text-gray-700 mb-1">Descripción corta <span className="text-red-500">*</span></label>
            <textarea id="short-description" required rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Describí tu club en pocas palabras" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
          </div>

          <div>
            <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">Email de contacto del club <span className="text-red-500">*</span></label>
            <input id="contact-email" type="email" required className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="contacto@tuclub.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>

          <div>
            <label htmlFor="slogan" className="block text-sm font-medium text-gray-700 mb-1">Slogan (opcional)</label>
            <input id="slogan" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ej: Cada mes, una nueva aventura" value={slogan} onChange={(e) => setSlogan(e.target.value)} />
          </div>

          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">WhatsApp de contacto (opcional)</label>
            <input id="whatsapp" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="+54 11 1234-5678" value={whatsappContact} onChange={(e) => setWhatsappContact(e.target.value)} />
          </div>

          <hr className="border-gray-200" />

          <p className="text-sm font-medium text-gray-700">Tu ubicación (opcional)</p>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
            <input id="city" type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Ej: Buenos Aires" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>

          <div>
            <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
            <select id="province" className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={province} onChange={(e) => setProvince(e.target.value)}>
              <option value="">Seleccioná una provincia</option>
              {PROVINCES.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="flex flex-col space-y-3 pt-2">
            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
              {loading ? 'Creando club...' : 'Crear mi club'}
            </button>
            <button type="button" onClick={handleSkip} className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
              Completar más tarde
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteClubPage;
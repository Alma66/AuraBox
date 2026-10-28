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

const CompleteProfilePage: React.FC = () => {
  const [streetAddress, setStreetAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('pending_user_id');
    const userType = localStorage.getItem('pending_user_type');
    if (!userId || userType !== 'customer') {
      navigate('/register');
    }
  }, [navigate]);

  const handleSkip = () => {
    localStorage.removeItem('pending_user_id');
    localStorage.removeItem('pending_user_type');
    navigate('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const userId = localStorage.getItem('pending_user_id');

    try {
      await api.post('/auth/register/customer/complete-profile', {
        userId,
        streetAddress: streetAddress || null,
        addressNumber: addressNumber || null,
        floorNumber: floorNumber || null,
        addressDetails: addressDetails || null,
        city: city || null,
        province: province || null,
        postalCode: postalCode || null,
      });

      localStorage.removeItem('pending_user_id');
      localStorage.removeItem('pending_user_type');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar los datos. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-aurora-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 p-10 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-aurora-navy">¡Casi listo!</h2>
          <p className="mt-2 text-center text-sm text-aurora-navy/70">
            Completá tu dirección para que los clubes puedan enviarte tus cajas.
            Podés hacerlo ahora o más tarde desde tu perfil.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-aurora-navy/80 mb-1">Calle</label>
            <input id="street" type="text" className="w-full px-3 py-2 border border-aurora-navy/20 rounded-md text-aurora-navy focus:outline-none focus:ring-aurora-terracotta focus:border-aurora-terracotta sm:text-sm" placeholder="Ej: Av. Corrientes" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="address-number" className="block text-sm font-medium text-aurora-navy/80 mb-1">Número</label>
              <input id="address-number" type="number" className="w-full px-3 py-2 border border-aurora-navy/20 rounded-md text-aurora-navy focus:outline-none focus:ring-aurora-terracotta focus:border-aurora-terracotta sm:text-sm" placeholder="1234" value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} />
            </div>
            <div>
              <label htmlFor="floor" className="block text-sm font-medium text-aurora-navy/80 mb-1">Piso / Dpto</label>
              <input id="floor" type="text" className="w-full px-3 py-2 border border-aurora-navy/20 rounded-md text-aurora-navy focus:outline-none focus:ring-aurora-terracotta focus:border-aurora-terracotta sm:text-sm" placeholder="Ej: 3B" value={floorNumber} onChange={(e) => setFloorNumber(e.target.value)} />
            </div>
          </div>

          <div>
            <label htmlFor="details" className="block text-sm font-medium text-aurora-navy/80 mb-1">Referencias adicionales</label>
            <input id="details" type="text" className="w-full px-3 py-2 border border-aurora-navy/20 rounded-md text-aurora-navy focus:outline-none focus:ring-aurora-terracotta focus:border-aurora-terracotta sm:text-sm" placeholder="Ej: Timbre 4, edificio azul" value={addressDetails} onChange={(e) => setAddressDetails(e.target.value)} />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-aurora-navy/80 mb-1">Ciudad / Localidad</label>
            <input id="city" type="text" className="w-full px-3 py-2 border border-aurora-navy/20 rounded-md text-aurora-navy focus:outline-none focus:ring-aurora-terracotta focus:border-aurora-terracotta sm:text-sm" placeholder="Ej: Rosario" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>

          <div>
            <label htmlFor="province" className="block text-sm font-medium text-aurora-navy/80 mb-1">Provincia</label>
            <select id="province" className="w-full px-3 py-2 border border-aurora-navy/20 rounded-md text-aurora-navy focus:outline-none focus:ring-aurora-terracotta focus:border-aurora-terracotta sm:text-sm" value={province} onChange={(e) => setProvince(e.target.value)}>
              <option value="">Seleccioná una provincia</option>
              {PROVINCES.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
          </div>

          <div>
            <label htmlFor="postal-code" className="block text-sm font-medium text-aurora-navy/80 mb-1">Código Postal</label>
            <input id="postal-code" type="text" className="w-full px-3 py-2 border border-aurora-navy/20 rounded-md text-aurora-navy focus:outline-none focus:ring-aurora-terracotta focus:border-aurora-terracotta sm:text-sm" placeholder="Ej: 1414" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="flex flex-col space-y-3 pt-2">
            <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-aurora-terracotta hover:bg-aurora-terracottaDark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aurora-terracotta disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar y continuar'}
            </button>
            <button type="button" onClick={handleSkip} className="w-full flex justify-center py-2 px-4 border border-aurora-navy/20 text-sm font-medium rounded-md text-aurora-navy/80 bg-white hover:bg-aurora-cream focus:outline-none">
              Completar más tarde
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
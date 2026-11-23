import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';
import { PROVINCES } from '../constants/provinces';
import AuthLayout from '../components/common/AuthLayout';

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
    if (!localStorage.getItem('pending_profile_token')) {
      navigate('/register');
    }
  }, [navigate]);

  const handleSkip = () => {
    localStorage.removeItem('pending_profile_token');
    navigate('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const profileToken = localStorage.getItem('pending_profile_token');

    try {
      await api.post('/auth/register/customer/complete-profile', {
        profileToken,
        streetAddress: streetAddress || null,
        addressNumber: addressNumber || null,
        floorNumber: floorNumber || null,
        addressDetails: addressDetails || null,
        city: city || null,
        province: province || null,
        postalCode: postalCode || null,
      });

      localStorage.removeItem('pending_profile_token');
      navigate('/login');
    } catch (err: any) {
      const message = err.response?.data?.message;
      setError(
        Array.isArray(message)
          ? message.join('. ')
          : message || 'Error al guardar los datos. Intentá de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      panelEyebrow="Casi listo"
      panelTitle="Contanos adónde te mandamos tus cajas"
      panelText="Con tu dirección, los clubes pueden enviarte tus suscripciones sin vueltas."
      points={[
        'Podés completarla ahora o más tarde desde tu perfil',
        'Todos los campos son opcionales en este paso',
        'Después podés editarla cuando quieras',
      ]}
    >
      <div className="space-y-6 rounded-3xl bg-white p-8 shadow-aurora ring-1 ring-aurora-navy/5 sm:p-10">
        <div>
          <img src="/aurabox-mark.svg" alt="AuraBox" className="mb-5 h-12 w-12 rounded-xl lg:hidden" />
          <span className="section-eyebrow">Tu cuenta está creada</span>
          <h1 className="font-display text-4xl font-medium text-aurora-navy">¡Casi listo!</h1>
          <p className="mt-2 text-sm text-aurora-navy/60">
            Completá tu dirección para que los clubes puedan enviarte tus cajas. Podés hacerlo ahora o más tarde desde tu perfil.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="street" className="mb-1 block text-xs font-medium text-aurora-navy/70">Calle</label>
            <input id="street" type="text" autoComplete="address-line1" className="input-aurora" placeholder="Ej: Av. Corrientes" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="address-number" className="mb-1 block text-xs font-medium text-aurora-navy/70">Número</label>
              <input id="address-number" type="number" className="input-aurora" placeholder="1234" value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} />
            </div>
            <div>
              <label htmlFor="floor" className="mb-1 block text-xs font-medium text-aurora-navy/70">Piso / Dpto</label>
              <input id="floor" type="text" autoComplete="address-line2" className="input-aurora" placeholder="Ej: 3B" value={floorNumber} onChange={(e) => setFloorNumber(e.target.value)} />
            </div>
          </div>

          <div>
            <label htmlFor="details" className="mb-1 block text-xs font-medium text-aurora-navy/70">Referencias adicionales</label>
            <input id="details" type="text" className="input-aurora" placeholder="Ej: Timbre 4, edificio azul" value={addressDetails} onChange={(e) => setAddressDetails(e.target.value)} />
          </div>

          <div>
            <label htmlFor="city" className="mb-1 block text-xs font-medium text-aurora-navy/70">Ciudad / Localidad</label>
            <input id="city" type="text" autoComplete="address-level2" className="input-aurora" placeholder="Ej: Rosario" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="province" className="mb-1 block text-xs font-medium text-aurora-navy/70">Provincia</label>
              <select id="province" className="input-aurora" value={province} onChange={(e) => setProvince(e.target.value)}>
                <option value="">Elegí una</option>
                {PROVINCES.map((p) => (<option key={p} value={p}>{p}</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="postal-code" className="mb-1 block text-xs font-medium text-aurora-navy/70">Código postal</label>
              <input id="postal-code" type="text" autoComplete="postal-code" className="input-aurora" placeholder="Ej: 1414" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </div>
          </div>

          {error && <p role="alert" className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-center text-sm text-red-600">{error}</p>}

          <div className="flex flex-col gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary btn-shine w-full disabled:opacity-60">
              {loading ? 'Guardando...' : 'Guardar y continuar'}
            </button>
            <button type="button" onClick={handleSkip} disabled={loading} className="btn-outline w-full">
              Completar más tarde
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default CompleteProfilePage;
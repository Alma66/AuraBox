import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/config';
import AuthHero from '../../components/native/AuthHero';
import { PROVINCES } from '../../constants/provinces';
import { getErrorMessage } from '../../utils/format';
import { tapFeedback } from '../../utils/native';

type FieldName = 'streetAddress' | 'addressNumber' | 'floorNumber' | 'addressDetails' | 'city' | 'postalCode';
type FieldErrors = Partial<Record<FieldName, string>>;

const POSTAL_CODE_PATTERN = /^(\d{4}|[A-Za-z]\d{4}[A-Za-z]{3})$/;

const readToken = (): string | null => {
  try {
    return localStorage.getItem('pending_profile_token');
  } catch {
    return null;
  }
};

const Field: React.FC<{ id: string; label: string; error?: string; children: React.ReactNode }> = ({ id, label, error, children }) => (
  <div>
    <label htmlFor={id} className="mb-1 block text-sm font-bold text-aurora-navy">
      {label}
    </label>
    {children}
    {error && (
      <p role="alert" className="mt-1 text-xs font-semibold text-red-600">
        {error}
      </p>
    )}
  </div>
);

const inputClass = (error?: string) =>
  `input-aurora !py-3.5 !text-base ${error ? '!border-red-400 focus:!ring-red-300' : ''}`;

const NativeCompleteProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [hasToken] = useState(() => readToken() !== null);
  const [streetAddress, setStreetAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!hasToken) return <Navigate to="/register" replace />;

  const clearError = (name: FieldName) => {
    setErrors((previous) => (previous[name] ? { ...previous, [name]: undefined } : previous));
  };

  const finish = () => {
    try {
      localStorage.removeItem('pending_profile_token');
    } catch {
      return navigate('/login?reason=registered', { replace: true });
    }
    return navigate('/login?reason=registered', { replace: true });
  };

  const handleSkip = () => {
    tapFeedback();
    finish();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    const nothingFilled = [streetAddress, addressNumber, floorNumber, addressDetails, city, province, postalCode].every(
      (value) => !value.trim(),
    );
    if (nothingFilled) {
      finish();
      return;
    }

    const found: FieldErrors = {};
    if (postalCode.trim() && !POSTAL_CODE_PATTERN.test(postalCode.trim())) {
      found.postalCode = 'Código postal inválido. Ejemplos: 1425 o C1425ABC.';
    }
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    tapFeedback();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register/customer/complete-profile', {
        profileToken: readToken(),
        streetAddress: streetAddress.trim() || null,
        addressNumber: addressNumber.trim() || null,
        floorNumber: floorNumber.trim() || null,
        addressDetails: addressDetails.trim() || null,
        city: city.trim() || null,
        province: province || null,
        postalCode: postalCode.trim() || null,
      });
      finish();
    } catch (err: any) {
      if (err?.response?.status === 401) {
        toast.error('Venció el tiempo para completar tu dirección. Iniciá sesión y cargala desde tu cuenta.');
        finish();
        return;
      }
      if (err?.response?.status === 429) {
        setError('Demasiados intentos. Esperá un minuto e intentá de nuevo.');
        return;
      }
      setError(getErrorMessage(err, 'No pudimos guardar tu dirección. Intentá de nuevo.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-aurora-cream">
      <AuthHero title="¡Casi listo!" subtitle="Completá tu dirección para que los clubes puedan enviarte tus cajas." />

      <form onSubmit={handleSubmit} noValidate className="relative -mt-8 rounded-t-[2rem] bg-aurora-cream px-4 pt-6">
        <p className="mb-5 text-sm text-aurora-navy/65">Podés hacerlo ahora o más tarde desde tu cuenta.</p>

        <div className="space-y-4">
          <Field id="cp-street" label="Calle" error={errors.streetAddress}>
            <input
              id="cp-street"
              type="text"
              autoComplete="address-line1"
              autoCapitalize="words"
              enterKeyHint="next"
              maxLength={120}
              placeholder="Ej: Av. Corrientes"
              value={streetAddress}
              onChange={(event) => {
                setStreetAddress(event.target.value);
                clearError('streetAddress');
              }}
              className={inputClass(errors.streetAddress)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field id="cp-number" label="Número" error={errors.addressNumber}>
              <input
                id="cp-number"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                enterKeyHint="next"
                placeholder="1234"
                value={addressNumber}
                onChange={(event) => {
                  setAddressNumber(event.target.value.replace(/\D/g, '').slice(0, 5));
                  clearError('addressNumber');
                }}
                className={inputClass(errors.addressNumber)}
              />
            </Field>
            <Field id="cp-floor" label="Piso / Dpto" error={errors.floorNumber}>
              <input
                id="cp-floor"
                type="text"
                autoComplete="off"
                enterKeyHint="next"
                maxLength={20}
                placeholder="Ej: 3B"
                value={floorNumber}
                onChange={(event) => {
                  setFloorNumber(event.target.value);
                  clearError('floorNumber');
                }}
                className={inputClass(errors.floorNumber)}
              />
            </Field>
          </div>

          <Field id="cp-details" label="Referencias adicionales" error={errors.addressDetails}>
            <input
              id="cp-details"
              type="text"
              autoComplete="off"
              enterKeyHint="next"
              maxLength={500}
              placeholder="Ej: Timbre 4, edificio azul"
              value={addressDetails}
              onChange={(event) => {
                setAddressDetails(event.target.value);
                clearError('addressDetails');
              }}
              className={inputClass(errors.addressDetails)}
            />
          </Field>

          <Field id="cp-city" label="Ciudad o localidad" error={errors.city}>
            <input
              id="cp-city"
              type="text"
              autoComplete="address-level2"
              autoCapitalize="words"
              enterKeyHint="next"
              maxLength={80}
              placeholder="Ej: Rosario"
              value={city}
              onChange={(event) => {
                setCity(event.target.value);
                clearError('city');
              }}
              className={inputClass(errors.city)}
            />
          </Field>

          <Field id="cp-province" label="Provincia">
            <select id="cp-province" value={province} onChange={(event) => setProvince(event.target.value)} className={inputClass()}>
              <option value="">Seleccioná una provincia</option>
              {PROVINCES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </Field>

          <Field id="cp-postal" label="Código postal" error={errors.postalCode}>
            <input
              id="cp-postal"
              type="text"
              autoComplete="postal-code"
              autoCapitalize="characters"
              enterKeyHint="go"
              maxLength={8}
              placeholder="Ej: 1414"
              value={postalCode}
              onChange={(event) => {
                setPostalCode(event.target.value);
                clearError('postalCode');
              }}
              className={inputClass(errors.postalCode)}
            />
          </Field>

          {error && (
            <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </p>
          )}
        </div>

        <div
          className="sticky bottom-0 z-30 -mx-4 mt-6 space-y-1 border-t border-aurora-navy/10 bg-white/95 px-4 pt-3 backdrop-blur-md"
          style={{ paddingBottom: 'calc(0.75rem + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))' }}
        >
          <button type="submit" disabled={loading} className="btn-primary min-h-[52px] w-full !text-base disabled:opacity-60">
            {loading ? 'Guardando…' : 'Guardar y continuar'}
          </button>
          <button
            type="button"
            onClick={handleSkip}
            disabled={loading}
            className="min-h-[48px] w-full rounded-full font-semibold text-aurora-navy/70 active:bg-aurora-cream disabled:opacity-60"
          >
            Completar más tarde
          </button>
        </div>
      </form>
    </div>
  );
};

export default NativeCompleteProfilePage;
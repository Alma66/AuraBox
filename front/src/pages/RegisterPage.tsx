import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/config';

const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [documentType, setDocumentType] = useState('DNI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
  };
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  const validateStep1 = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !birthDate) {
      setError('Completá todos los campos obligatorios.');
      return false;
    }
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    if (age < 16) {
      setError('Debés tener al menos 16 años para registrarte.');
      return false;
    }
    setError('');
    return true;
  };

  const goToStep2 = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!documentNumber.trim()) {
      setError('El número de documento es obligatorio.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (passwordStrength < 4) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.');
      return;
    }
    setLoading(true);
    try {
      const dto = {
        firstName,
        lastName,
        email,
        password,
        documentType,
        documentNumber,
        phoneNumber: phoneNumber || null,
        birthDate,
      };
      const response = await api.post('/auth/register/customer', dto);
      const data = response.data?.data ?? response.data;
      localStorage.setItem('pending_user_id', data.id.toString());
      localStorage.setItem('pending_user_type', 'customer');
      navigate('/register/complete-profile');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-aurora-cream py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute -top-32 -right-20 w-96 h-96 bg-aurora-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-aurora-terracotta/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 p-10 card-surface shadow-aurora relative animate-fadeInUp">
        <div>
          <div className="flex justify-center mb-4">
            <img src="/aurabox-logo.png" alt="AuraBox" className="h-14 w-auto" />
          </div>
          <h2 className="text-center font-display text-3xl font-bold text-aurora-navy">
            Creá tu cuenta en AuraBox
          </h2>
          <p className="mt-2 text-center text-sm text-aurora-navy/60">
            ¿Ya tenés una cuenta?{' '}
            <Link to="/login" className="font-semibold text-aurora-terracotta hover:text-aurora-terracottaDark">
              Iniciá sesión aquí
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-aurora-terracotta' : 'bg-aurora-navy/10'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-aurora-terracotta' : 'bg-aurora-navy/10'}`} />
        </div>
        <p className="text-xs text-center text-aurora-navy/50 font-medium">Paso {step} de 2</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="first-name" className="block text-xs font-medium text-aurora-navy/70 mb-1">Nombre</label>
                  <input id="first-name" type="text" required className="input-aurora" placeholder="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="last-name" className="block text-xs font-medium text-aurora-navy/70 mb-1">Apellido</label>
                  <input id="last-name" type="text" required className="input-aurora" placeholder="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div>
                <label htmlFor="email-address" className="block text-xs font-medium text-aurora-navy/70 mb-1">Email</label>
                <input id="email-address" type="email" autoComplete="email" required className="input-aurora" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label htmlFor="birth-date" className="block text-xs font-medium text-aurora-navy/70 mb-1">Fecha de Nacimiento</label>
                <input id="birth-date" type="date" required className="input-aurora" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              </div>

              {error && <p className="text-red-600 text-sm text-center bg-red-50 border border-red-100 rounded-lg py-2 px-3">{error}</p>}

              <button type="button" onClick={goToStep2} className="btn-primary w-full">
                Continuar
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="document-type" className="block text-xs font-medium text-aurora-navy/70 mb-1">Tipo de Documento</label>
                  <select id="document-type" required className="input-aurora" value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
                    <option value="DNI">DNI</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="LC">LC</option>
                    <option value="LE">LE</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="document-number" className="block text-xs font-medium text-aurora-navy/70 mb-1">Número</label>
                  <input id="document-number" type="number" required className="input-aurora" placeholder="12345678" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} />
                </div>
              </div>
              <div>
                <label htmlFor="phone-number" className="block text-xs font-medium text-aurora-navy/70 mb-1">Teléfono (opcional)</label>
                <input id="phone-number" type="tel" className="input-aurora" placeholder="+54 11 1234-5678" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-aurora-navy/70 mb-1">Contraseña</label>
                <input id="password" type="password" autoComplete="new-password" required className="input-aurora" placeholder="Mínimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
                {password && (
                  <div className="flex gap-1 mt-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                        passwordStrength > i
                          ? passwordStrength <= 2 ? 'bg-red-400' : passwordStrength === 3 ? 'bg-aurora-gold' : 'bg-green-500'
                          : 'bg-aurora-navy/10'
                      }`} />
                    ))}
                  </div>
                )}
                <p className="text-xs text-aurora-navy/45 mt-1">8+ caracteres, mayúscula, minúscula y número</p>
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-xs font-medium text-aurora-navy/70 mb-1">Confirmar Contraseña</label>
                <input id="confirm-password" type="password" autoComplete="new-password" required className="input-aurora" placeholder="Repetí tu contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>

              {error && <p className="text-red-600 text-sm text-center bg-red-50 border border-red-100 rounded-lg py-2 px-3">{error}</p>}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1">
                  Atrás
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Registrando...' : 'Crear cuenta'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
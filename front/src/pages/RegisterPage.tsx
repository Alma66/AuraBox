import React, { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import api, { getResponseData } from '../api/config';
import { PROVINCES } from '../constants/provinces';

type AccountType = 'customer' | 'entrepreneur';

interface LegalRule {
  id: number;
  title: string;
  version: string;
  ruleType: string;
}

type RulesStatus = 'loading' | 'ready' | 'error';
type FieldErrors = Record<string, string>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FIELD_IDS: Record<string, string> = {
  firstName: 'first-name',
  lastName: 'last-name',
  email: 'email-address',
  birthDate: 'birth-date',
  documentNumber: 'document-number',
  phoneNumber: 'phone-number',
  password: 'password',
  confirmPassword: 'confirm-password',
  terms: 'accept-terms',
};

const FieldError: React.FC<{ id: string; message?: string }> = ({ id, message }) =>
  message ? (
    <p id={id} role="alert" className="mt-1 text-xs text-red-600">
      {message}
    </p>
  ) : null;

const RequiredMark: React.FC = () => (
  <span className="text-aurora-terracotta" aria-hidden="true">
    {' '}*
  </span>
);

const MIN_AGE: Record<AccountType, number> = { customer: 16, entrepreneur: 18 };

const COPY: Record<AccountType, { title: string; eyebrow: string; subtitle: string; submit: string }> = {
  customer: {
    eyebrow: 'Cuenta de cliente',
    title: 'Creá tu cuenta en AuraBox',
    subtitle: 'Suscribite a clubes y recibí cajas sorpresa en tu casa.',
    submit: 'Crear cuenta',
  },
  entrepreneur: {
    eyebrow: 'Cuenta de emprendedor',
    title: 'Sumá tu club a AuraBox',
    subtitle: 'Creá tu cuenta de emprendedor y registrá tu club. Nuestro equipo lo revisa antes de publicarlo.',
    submit: 'Crear cuenta de emprendedor',
  },
};

interface RegisterPageProps {
  accountType?: AccountType;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ accountType = 'customer' }) => {
  const [searchParams] = useSearchParams();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [documentType, setDocumentType] = useState('DNI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [rules, setRules] = useState<LegalRule[]>([]);
  const [rulesStatus, setRulesStatus] = useState<RulesStatus>('loading');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const loadRules = useCallback(async () => {
    setRulesStatus('loading');
    setAcceptedTerms(false);
    try {
      const response = await api.get(`/platform-rules/required/${accountType}`);
      setRules(getResponseData(response) || []);
      setRulesStatus('ready');
    } catch {
      setRules([]);
      setRulesStatus('error');
    }
  }, [accountType]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  if (accountType === 'customer' && searchParams.get('role') === 'entrepreneur') {
    return <Navigate to="/register/entrepreneur" replace />;
  }

  const copy = COPY[accountType];

  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
  };
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  const inputClass = (name: string, extra = '') =>
    `input-aurora ${extra} ${fieldErrors[name] ? 'border-red-400 focus:border-red-400 focus:ring-red-300/60' : ''}`.trim();

  const clearFieldError = (name: string) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const focusField = (name: string) => {
    const id = FIELD_IDS[name];
    if (!id) return;
    window.setTimeout(() => document.getElementById(id)?.focus(), 0);
  };

  const showFieldErrors = (errors: FieldErrors) => {
    setFieldErrors(errors);
    const first = Object.keys(errors)[0];
    if (first) focusField(first);
  };

  const validateStep1 = () => {
    const errors: FieldErrors = {};
    if (!firstName.trim()) errors.firstName = 'Ingresá tu nombre.';
    if (!lastName.trim()) errors.lastName = 'Ingresá tu apellido.';
    if (!email.trim()) {
      errors.email = 'Ingresá tu email.';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = 'Ingresá un email válido, por ejemplo tu@email.com.';
    }
    if (!birthDate) {
      errors.birthDate = 'Ingresá tu fecha de nacimiento.';
    } else {
      const birth = new Date(birthDate);
      const today = new Date();
      if (Number.isNaN(birth.getTime()) || birth > today) {
        errors.birthDate = 'Ingresá una fecha de nacimiento válida.';
      } else {
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
        if (age < MIN_AGE[accountType]) {
          errors.birthDate =
            accountType === 'entrepreneur'
              ? 'Debés ser mayor de 18 años para registrarte como emprendedor.'
              : 'Debés tener al menos 16 años para registrarte.';
        } else if (age > 120) {
          errors.birthDate = 'Ingresá una fecha de nacimiento válida.';
        }
      }
    }
    setError('');
    showFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goToStep2 = () => {
    if (validateStep1()) setStep(2);
  };

  const applyServerError = (text: string) => {
    if (/email/i.test(text)) {
      setStep(1);
      setError('');
      showFieldErrors({ email: text });
      return;
    }
    if (/documento/i.test(text)) {
      setError('');
      showFieldErrors({ documentNumber: text });
      return;
    }
    if (/tel[eé]fono/i.test(text)) {
      setError('');
      showFieldErrors({ phoneNumber: text });
      return;
    }
    setError(text);
  };

  const confirmMismatch = confirmPassword.length > 0 && confirmPassword !== password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      goToStep2();
      return;
    }
    setError('');
    const errors: FieldErrors = {};
    const documentDigits = documentNumber.replace(/\D/g, '');
    if (!documentDigits) {
      errors.documentNumber = 'Ingresá tu número de documento.';
    } else if (documentDigits.length < 6 || documentDigits.length > 9) {
      errors.documentNumber = 'El documento debe tener entre 6 y 9 dígitos.';
    }
    const phoneDigits = phoneNumber.replace(/\D/g, '');
    if (phoneDigits && (phoneDigits.length < 8 || phoneDigits.length > 15)) {
      errors.phoneNumber = 'El teléfono debe tener entre 8 y 15 dígitos.';
    }
    if (!password) {
      errors.password = 'Ingresá una contraseña.';
    } else if (passwordStrength < 4) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.';
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Repetí tu contraseña.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden.';
    }
    if (rules.length > 0 && !acceptedTerms) {
      errors.terms = 'Tenés que aceptar los términos para crear tu cuenta.';
    }
    if (Object.keys(errors).length > 0) {
      showFieldErrors(errors);
      return;
    }
    if (rulesStatus === 'error') {
      setError('No pudimos cargar los términos de uso. Recargá la página e intentá de nuevo.');
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      const dto: Record<string, unknown> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        documentType,
        documentNumber: documentDigits,
        phoneNumber: phoneDigits || null,
        birthDate,
        acceptedRuleIds: rules.map((rule) => rule.id),
      };
      if (accountType === 'entrepreneur') {
        dto.city = city || null;
        dto.province = province || null;
      }
      const endpoint = accountType === 'entrepreneur' ? '/auth/register/entrepreneur' : '/auth/register/customer';
      const response = await api.post(endpoint, dto);
      const data = response.data?.data ?? response.data;
      if (accountType === 'entrepreneur') {
        localStorage.removeItem('pending_profile_token');
        localStorage.setItem('pending_entrepreneur_token', data.entrepreneurToken);
        navigate('/register/complete-club');
      } else {
        localStorage.removeItem('pending_entrepreneur_token');
        localStorage.setItem('pending_profile_token', data.profileToken);
        navigate('/register/complete-profile');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message;
      const text = Array.isArray(msg)
        ? msg.join('. ')
        : msg || (err.response ? 'Error al registrarse. Intentá de nuevo.' : 'No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.');
      applyServerError(text);
      if (typeof text === 'string' && text.includes('Falta tu aceptación')) {
        loadRules();
      }
    } finally {
      setLoading(false);
    }
  };

  const submitDisabled = loading || rulesStatus === 'loading';

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-aurora-cream py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute -top-32 -right-20 w-96 h-96 bg-aurora-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-aurora-terracotta/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 p-10 card-surface shadow-aurora relative animate-fadeInUp">
        <div>
          <div className="flex justify-center mb-4">
            <img src="/aurabox-mark.svg" alt="AuraBox" className="h-14 w-14 rounded-xl" />
          </div>
          <span className="section-eyebrow block text-center">{copy.eyebrow}</span>
          <h1 className="text-center font-display text-3xl font-bold text-aurora-navy">{copy.title}</h1>
          <p className="mt-2 text-center text-sm text-aurora-navy/60">{copy.subtitle}</p>
          <p className="mt-2 text-center text-sm text-aurora-navy/60">
            ¿Ya tenés una cuenta?{' '}
            <Link to="/login" className="font-semibold text-aurora-terracotta hover:text-aurora-terracottaDark">
              Iniciá sesión aquí
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2" aria-hidden="true">
          <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-aurora-terracotta' : 'bg-aurora-navy/10'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-aurora-terracotta' : 'bg-aurora-navy/10'}`} />
        </div>
        <p className="text-xs text-center text-aurora-navy/50 font-medium">Paso {step} de 2</p>
        <p className="text-xs text-center text-aurora-navy/50">Los campos con <span className="text-aurora-terracotta font-semibold">*</span> son obligatorios.</p>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="first-name" className="block text-xs font-medium text-aurora-navy/70 mb-1">Nombre<RequiredMark /></label>
                  <input
                    id="first-name"
                    type="text"
                    autoComplete="given-name"
                    maxLength={60}
                    aria-invalid={!!fieldErrors.firstName}
                    aria-describedby={fieldErrors.firstName ? 'first-name-error' : undefined}
                    className={inputClass('firstName')}
                    placeholder="Nombre"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      clearFieldError('firstName');
                    }}
                  />
                  <FieldError id="first-name-error" message={fieldErrors.firstName} />
                </div>
                <div>
                  <label htmlFor="last-name" className="block text-xs font-medium text-aurora-navy/70 mb-1">Apellido<RequiredMark /></label>
                  <input
                    id="last-name"
                    type="text"
                    autoComplete="family-name"
                    maxLength={60}
                    aria-invalid={!!fieldErrors.lastName}
                    aria-describedby={fieldErrors.lastName ? 'last-name-error' : undefined}
                    className={inputClass('lastName')}
                    placeholder="Apellido"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      clearFieldError('lastName');
                    }}
                  />
                  <FieldError id="last-name-error" message={fieldErrors.lastName} />
                </div>
              </div>
              <div>
                <label htmlFor="email-address" className="block text-xs font-medium text-aurora-navy/70 mb-1">Email<RequiredMark /></label>
                <input
                  id="email-address"
                  type="email"
                  autoComplete="email"
                  maxLength={120}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  className={inputClass('email')}
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError('email');
                  }}
                />
                <FieldError id="email-error" message={fieldErrors.email} />
              </div>
              <div>
                <label htmlFor="birth-date" className="block text-xs font-medium text-aurora-navy/70 mb-1">Fecha de Nacimiento<RequiredMark /></label>
                <input
                  id="birth-date"
                  type="date"
                  autoComplete="bday"
                  aria-invalid={!!fieldErrors.birthDate}
                  aria-describedby={fieldErrors.birthDate ? 'birth-date-error' : undefined}
                  className={inputClass('birthDate')}
                  value={birthDate}
                  onChange={(e) => {
                    setBirthDate(e.target.value);
                    clearFieldError('birthDate');
                  }}
                />
                <FieldError id="birth-date-error" message={fieldErrors.birthDate} />
              </div>

              {error && <p role="alert" className="text-red-600 text-sm text-center bg-red-50 border border-red-100 rounded-lg py-2 px-3">{error}</p>}

              <button type="button" onClick={goToStep2} className="btn-primary w-full">
                Continuar
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="document-type" className="block text-xs font-medium text-aurora-navy/70 mb-1">Tipo de Documento<RequiredMark /></label>
                  <select id="document-type" className="input-aurora" value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
                    <option value="DNI">DNI</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="LC">LC</option>
                    <option value="LE">LE</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="document-number" className="block text-xs font-medium text-aurora-navy/70 mb-1">Número<RequiredMark /></label>
                  <input
                    id="document-number"
                    type="text"
                    inputMode="numeric"
                    maxLength={9}
                    aria-invalid={!!fieldErrors.documentNumber}
                    aria-describedby={fieldErrors.documentNumber ? 'document-number-error' : undefined}
                    className={inputClass('documentNumber')}
                    placeholder="12345678"
                    value={documentNumber}
                    onChange={(e) => {
                      setDocumentNumber(e.target.value.replace(/\D/g, '').slice(0, 9));
                      clearFieldError('documentNumber');
                    }}
                  />
                </div>
              </div>
              <FieldError id="document-number-error" message={fieldErrors.documentNumber} />
              <div>
                <label htmlFor="phone-number" className="block text-xs font-medium text-aurora-navy/70 mb-1">Teléfono (opcional)</label>
                <input
                  id="phone-number"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={20}
                  aria-invalid={!!fieldErrors.phoneNumber}
                  aria-describedby={fieldErrors.phoneNumber ? 'phone-number-error' : undefined}
                  className={inputClass('phoneNumber')}
                  placeholder="11 1234-5678"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value.replace(/[^\d+\-()\s]/g, ''));
                    clearFieldError('phoneNumber');
                  }}
                />
                <FieldError id="phone-number-error" message={fieldErrors.phoneNumber} />
              </div>

              {accountType === 'entrepreneur' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="city" className="block text-xs font-medium text-aurora-navy/70 mb-1">Ciudad (opcional)</label>
                    <input id="city" type="text" className="input-aurora" placeholder="Ej: Rosario" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div>
                    <label htmlFor="province" className="block text-xs font-medium text-aurora-navy/70 mb-1">Provincia</label>
                    <select id="province" className="input-aurora" value={province} onChange={(e) => setProvince(e.target.value)}>
                      <option value="">Elegí una</option>
                      {PROVINCES.map((p) => (<option key={p} value={p}>{p}</option>))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-aurora-navy/70 mb-1">Contraseña<RequiredMark /></label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    maxLength={72}
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                    className={inputClass('password', 'pr-16')}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFieldError('password');
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-aurora-navy/60 hover:text-aurora-terracotta"
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                {password && (
                  <div className="flex gap-1 mt-1.5" aria-hidden="true">
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
                <FieldError id="password-error" message={fieldErrors.password} />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-xs font-medium text-aurora-navy/70 mb-1">Confirmar Contraseña<RequiredMark /></label>
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  maxLength={72}
                  aria-invalid={!!fieldErrors.confirmPassword || confirmMismatch}
                  aria-describedby={fieldErrors.confirmPassword || confirmMismatch ? 'confirm-password-error' : undefined}
                  className={inputClass('confirmPassword', confirmMismatch ? 'border-red-400 focus:border-red-400 focus:ring-red-300/60' : '')}
                  placeholder="Repetí tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearFieldError('confirmPassword');
                  }}
                />
                <FieldError
                  id="confirm-password-error"
                  message={fieldErrors.confirmPassword || (confirmMismatch ? 'Las contraseñas no coinciden.' : undefined)}
                />
              </div>

              {rulesStatus === 'error' && (
                <div role="alert" className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
                  No pudimos cargar los términos de uso.{' '}
                  <button type="button" onClick={loadRules} className="font-semibold underline">
                    Reintentar
                  </button>
                </div>
              )}

              {rulesStatus === 'ready' && rules.length > 0 && (
                <div className={`flex items-start gap-3 rounded-xl bg-aurora-cream p-3 ${fieldErrors.terms ? 'ring-1 ring-red-400' : ''}`}>
                  <input
                    id="accept-terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);
                      clearFieldError('terms');
                    }}
                    className="mt-1 h-5 w-5 flex-shrink-0 rounded border-aurora-navy/30 accent-aurora-terracotta"
                  />
                  <label htmlFor="accept-terms" className="text-sm text-aurora-navy/80">
                    Leí y acepto{' '}
                    {rules.map((rule, index) => (
                      <React.Fragment key={rule.id}>
                        {index > 0 && (index === rules.length - 1 ? ' y ' : ', ')}
                        <Link
                          to={`/platform-rules#rule-${rule.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-aurora-terracotta underline hover:text-aurora-terracottaDark"
                        >
                          {rule.title} (v{rule.version})
                        </Link>
                      </React.Fragment>
                    ))}
                    .
                  </label>
                </div>
              )}
              <FieldError id="terms-error" message={fieldErrors.terms} />

              {error && <p role="alert" className="text-red-600 text-sm text-center bg-red-50 border border-red-100 rounded-lg py-2 px-3">{error}</p>}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1">
                  Atrás
                </button>
                <button type="submit" disabled={submitDisabled} className="btn-primary flex-1 disabled:opacity-50">
                  {loading ? 'Registrando...' : copy.submit}
                </button>
              </div>
            </>
          )}
        </form>

        <div className="border-t border-aurora-navy/10 pt-4 text-center text-sm text-aurora-navy/60">
          {accountType === 'customer' ? (
            <>
              ¿Tenés un emprendimiento?{' '}
              <Link to="/work-with-us" className="font-semibold text-aurora-terracotta hover:text-aurora-terracottaDark">
                Trabajá con nosotros
              </Link>
            </>
          ) : (
            <>
              ¿Querés comprar cajas?{' '}
              <Link to="/register" className="font-semibold text-aurora-terracotta hover:text-aurora-terracottaDark">
                Creá tu cuenta de cliente
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
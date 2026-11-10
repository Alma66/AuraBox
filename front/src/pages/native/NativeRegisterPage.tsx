import React, { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import api, { getResponseData } from '../../api/config';
import AuthHero from '../../components/native/AuthHero';
import BottomSheet from '../../components/native/BottomSheet';
import { getErrorMessage } from '../../utils/format';
import { tapFeedback } from '../../utils/native';

type AccountType = 'customer' | 'entrepreneur';
type RulesStatus = 'loading' | 'ready' | 'error';
type FieldName = 'firstName' | 'lastName' | 'email' | 'birthDate' | 'documentNumber' | 'phoneNumber' | 'password' | 'confirmPassword';
type FieldErrors = Partial<Record<FieldName, string>>;

interface LegalRule {
  id: number;
  title: string;
  content?: string;
  version: string;
  ruleType: string;
}

const MIN_AGE = 16;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STEP_TITLES = ['Tus datos', 'Documento y contacto', 'Tu contraseña'];

const ageFrom = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
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

const EntrepreneurWebNotice: React.FC = () => (
  <div className="px-6 py-16 text-center">
    <p className="text-6xl" aria-hidden="true">💻</p>
    <h1 className="mt-4 font-display text-2xl font-bold text-aurora-navy">El registro de emprendedores es desde la web</h1>
    <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-aurora-navy/65">
      Para crear tu emprendimiento y administrar tus planes, ingresá desde una computadora. Esta app está pensada para quienes compran y
      disfrutan sus cajas.
    </p>
    <a
      href="https://aura-box-blond.vercel.app/register/entrepreneur"
      target="_blank"
      rel="noopener noreferrer"
      className="btn-primary mt-6 w-full max-w-xs"
    >
      Abrir AuraBox en el navegador
    </a>
    <Link to="/register" className="btn-outline mt-3 w-full max-w-xs">
      Crear cuenta de cliente
    </Link>
  </div>
);

const CustomerRegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [documentType, setDocumentType] = useState('DNI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState<LegalRule[]>([]);
  const [rulesStatus, setRulesStatus] = useState<RulesStatus>('loading');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [openRule, setOpenRule] = useState<LegalRule | null>(null);

  const loadRules = useCallback(async (isActive: () => boolean) => {
    setRulesStatus('loading');
    setAcceptedTerms(false);
    try {
      const response = await api.get('/platform-rules/required/customer');
      if (!isActive()) return;
      setRules(getResponseData(response) || []);
      setRulesStatus('ready');
    } catch {
      if (!isActive()) return;
      setRules([]);
      setRulesStatus('error');
    }
  }, []);

  useEffect(() => {
    let active = true;
    loadRules(() => active);
    return () => {
      active = false;
    };
  }, [loadRules]);

  const passwordChecks = [
    { label: '8 caracteres o más', ok: password.length >= 8 },
    { label: 'Una mayúscula', ok: /[A-Z]/.test(password) },
    { label: 'Una minúscula', ok: /[a-z]/.test(password) },
    { label: 'Un número', ok: /\d/.test(password) },
  ];
  const passwordStrength = passwordChecks.filter((item) => item.ok).length;

  const validateStep = (target: number): FieldErrors => {
    const found: FieldErrors = {};
    if (target === 1) {
      if (!firstName.trim()) found.firstName = 'Ingresá tu nombre.';
      if (!lastName.trim()) found.lastName = 'Ingresá tu apellido.';
      if (!EMAIL_PATTERN.test(email.trim())) found.email = 'Ingresá un email válido.';
      if (!birthDate) found.birthDate = 'Ingresá tu fecha de nacimiento.';
      else if (ageFrom(birthDate) < MIN_AGE) found.birthDate = `Tenés que tener al menos ${MIN_AGE} años para registrarte.`;
    }
    if (target === 2) {
      if (!documentNumber.trim()) found.documentNumber = 'Ingresá tu número de documento.';
      const phoneDigits = phoneNumber.replace(/\D/g, '');
      if (phoneDigits && (phoneDigits.length < 8 || phoneDigits.length > 15)) {
        found.phoneNumber = 'El teléfono debe tener entre 8 y 15 dígitos.';
      }
    }
    if (target === 3) {
      if (passwordStrength < 4) found.password = 'Usá 8 caracteres o más, con mayúscula, minúscula y número.';
      if (password !== confirmPassword) found.confirmPassword = 'Las contraseñas no coinciden.';
    }
    return found;
  };

  const clearError = (name: FieldName) => {
    setErrors((previous) => (previous[name] ? { ...previous, [name]: undefined } : previous));
  };

  const goToStep = (target: number) => {
    setError('');
    setStep(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    const found = validateStep(step);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    goToStep(step + 1);
  };

  const handleSubmit = async () => {
    if (loading) return;
    const found = validateStep(3);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    if (rulesStatus === 'error') {
      setError('No pudimos cargar los términos de uso. Reintentá para continuar.');
      return;
    }
    if (rules.length > 0 && !acceptedTerms) {
      setError('Tenés que aceptar los términos para crear tu cuenta.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const phoneDigits = phoneNumber.replace(/\D/g, '');
      const response = await api.post('/auth/register/customer', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        documentType,
        documentNumber: documentNumber.trim(),
        phoneNumber: phoneDigits || null,
        birthDate,
        acceptedRuleIds: rules.map((rule) => rule.id),
      });
      const data = response.data?.data ?? response.data;
      localStorage.removeItem('pending_entrepreneur_token');
      localStorage.setItem('pending_profile_token', data.profileToken);
      navigate('/register/complete-profile', { replace: true });
    } catch (err: any) {
      if (err?.response?.status === 429) {
        setError('Demasiados intentos. Esperá un minuto e intentá de nuevo.');
      } else {
        const text = getErrorMessage(err, 'No pudimos crear tu cuenta. Intentá de nuevo.');
        setError(text);
        if (text.includes('Falta tu aceptación')) loadRules(() => true);
      }
    } finally {
      setLoading(false);
    }
  };

  const submitDisabled = loading || rulesStatus === 'loading' || (rules.length > 0 && !acceptedTerms);

  return (
    <div className="bg-aurora-cream">
      <AuthHero title="Creá tu cuenta" subtitle="Suscribite a clubes y recibí cajas sorpresa en tu casa." />

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (step < 3) handleNext();
          else handleSubmit();
        }}
        className="relative -mt-8 rounded-t-[2rem] bg-aurora-cream px-4 pt-6"
      >
        <div className="mb-1 flex items-center justify-between text-xs font-bold text-aurora-navy/55">
          <span>{STEP_TITLES[step - 1]}</span>
          <span>
            Paso {step} de 3
          </span>
        </div>
        <div className="mb-6 grid grid-cols-3 gap-1.5" aria-hidden="true">
          {[1, 2, 3].map((item) => (
            <span
              key={item}
              className={`h-1.5 rounded-full transition-colors duration-300 ${item <= step ? 'bg-aurora-terracotta' : 'bg-aurora-navy/10'}`}
            />
          ))}
        </div>

        <div className="space-y-4">
          {step === 1 && (
            <>
              <Field id="reg-first-name" label="Nombre" error={errors.firstName}>
                <input
                  id="reg-first-name"
                  type="text"
                  autoComplete="given-name"
                  autoCapitalize="words"
                  enterKeyHint="next"
                  value={firstName}
                  onChange={(event) => {
                    setFirstName(event.target.value);
                    clearError('firstName');
                  }}
                  className={inputClass(errors.firstName)}
                />
              </Field>
              <Field id="reg-last-name" label="Apellido" error={errors.lastName}>
                <input
                  id="reg-last-name"
                  type="text"
                  autoComplete="family-name"
                  autoCapitalize="words"
                  enterKeyHint="next"
                  value={lastName}
                  onChange={(event) => {
                    setLastName(event.target.value);
                    clearError('lastName');
                  }}
                  className={inputClass(errors.lastName)}
                />
              </Field>
              <Field id="reg-email" label="Email" error={errors.email}>
                <input
                  id="reg-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="next"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearError('email');
                  }}
                  className={inputClass(errors.email)}
                />
              </Field>
              <Field id="reg-birth" label="Fecha de nacimiento" error={errors.birthDate}>
                <input
                  id="reg-birth"
                  type="date"
                  autoComplete="bday"
                  max={new Date().toISOString().split('T')[0]}
                  value={birthDate}
                  onChange={(event) => {
                    setBirthDate(event.target.value);
                    clearError('birthDate');
                  }}
                  className={inputClass(errors.birthDate)}
                />
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Field id="reg-doc-type" label="Tipo de documento">
                <select id="reg-doc-type" value={documentType} onChange={(event) => setDocumentType(event.target.value)} className={inputClass()}>
                  <option value="DNI">DNI</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="LC">LC</option>
                  <option value="LE">LE</option>
                </select>
              </Field>
              <Field id="reg-doc-number" label="Número de documento" error={errors.documentNumber}>
                <input
                  id="reg-doc-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  enterKeyHint="next"
                  placeholder="12345678"
                  value={documentNumber}
                  onChange={(event) => {
                    setDocumentNumber(event.target.value.replace(/\D/g, '').slice(0, 15));
                    clearError('documentNumber');
                  }}
                  className={inputClass(errors.documentNumber)}
                />
              </Field>
              <Field id="reg-phone" label="Teléfono (opcional)" error={errors.phoneNumber}>
                <input
                  id="reg-phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  enterKeyHint="next"
                  placeholder="11 1234-5678"
                  value={phoneNumber}
                  onChange={(event) => {
                    setPhoneNumber(event.target.value);
                    clearError('phoneNumber');
                  }}
                  className={inputClass(errors.phoneNumber)}
                />
              </Field>
            </>
          )}

          {step === 3 && (
            <>
              <Field id="reg-password" label="Contraseña" error={errors.password}>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    autoCapitalize="none"
                    enterKeyHint="next"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      clearError('password');
                    }}
                    className={`${inputClass(errors.password)} !pr-24`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      tapFeedback();
                      setShowPassword((value) => !value);
                    }}
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 flex min-w-[88px] items-center justify-center px-3 text-sm font-semibold text-aurora-terracotta"
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-1" aria-hidden="true">
                  {[0, 1, 2, 3].map((item) => (
                    <span
                      key={item}
                      className={`h-1 rounded-full transition-colors duration-300 ${
                        passwordStrength > item
                          ? passwordStrength <= 2
                            ? 'bg-red-400'
                            : passwordStrength === 3
                              ? 'bg-aurora-gold'
                              : 'bg-green-500'
                          : 'bg-aurora-navy/10'
                      }`}
                    />
                  ))}
                </div>
                <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                  {passwordChecks.map((item) => (
                    <li key={item.label} className={`flex items-center gap-1.5 text-xs ${item.ok ? 'font-semibold text-green-700' : 'text-aurora-navy/50'}`}>
                      <span aria-hidden="true">{item.ok ? '✓' : '○'}</span>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </Field>
              <Field id="reg-confirm" label="Confirmar contraseña" error={errors.confirmPassword}>
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  autoCapitalize="none"
                  enterKeyHint="go"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    clearError('confirmPassword');
                  }}
                  className={inputClass(errors.confirmPassword)}
                />
              </Field>

              {rulesStatus === 'error' && (
                <div role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                  No pudimos cargar los términos de uso.{' '}
                  <button type="button" onClick={() => loadRules(() => true)} className="font-bold underline">
                    Reintentar
                  </button>
                </div>
              )}

              {rulesStatus === 'ready' && rules.length > 0 && (
                <div className="flex items-start gap-3 rounded-2xl bg-white p-4 ring-1 ring-aurora-navy/10">
                  <input
                    id="reg-terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                    className="mt-0.5 h-6 w-6 shrink-0 rounded border-aurora-navy/30 accent-aurora-terracotta"
                  />
                  <label htmlFor="reg-terms" className="text-sm leading-relaxed text-aurora-navy/80">
                    Leí y acepto{' '}
                    {rules.map((rule, index) => (
                      <React.Fragment key={rule.id}>
                        {index > 0 && (index === rules.length - 1 ? ' y ' : ', ')}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            tapFeedback();
                            setOpenRule(rule);
                          }}
                          className="font-bold text-aurora-terracotta underline"
                        >
                          {rule.title} (v{rule.version})
                        </button>
                      </React.Fragment>
                    ))}
                    .
                  </label>
                </div>
              )}
            </>
          )}

          {error && (
            <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </p>
          )}
        </div>

        <div
          className="sticky bottom-0 z-30 -mx-4 mt-6 flex items-center gap-3 border-t border-aurora-navy/10 bg-white/95 px-4 pt-3 backdrop-blur-md"
          style={{ paddingBottom: 'calc(0.75rem + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))' }}
        >
          {step > 1 && (
            <button
              type="button"
              onClick={() => {
                tapFeedback();
                goToStep(step - 1);
              }}
              disabled={loading}
              className="btn-outline min-h-[52px] flex-1 !text-base"
            >
              Atrás
            </button>
          )}
          {step < 3 ? (
            <button type="submit" className="btn-primary min-h-[52px] flex-1 !text-base">
              Continuar
            </button>
          ) : (
            <button type="submit" disabled={submitDisabled} className="btn-primary min-h-[52px] flex-1 !text-base disabled:opacity-50">
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          )}
        </div>

        <p className="pb-6 pt-4 text-center text-sm text-aurora-navy/60">
          ¿Ya tenés una cuenta?{' '}
          <Link to="/login" className="font-bold text-aurora-terracotta">
            Iniciá sesión
          </Link>
        </p>
      </form>

      <BottomSheet open={openRule !== null} title={openRule?.title ?? ''} onClose={() => setOpenRule(null)}>
        <p className="mb-3 text-xs font-semibold text-aurora-navy/50">Versión {openRule?.version}</p>
        <div className="selectable whitespace-pre-line text-sm leading-relaxed text-aurora-navy/80">{openRule?.content ?? 'Sin contenido disponible.'}</div>
      </BottomSheet>
    </div>
  );
};

const NativeRegisterPage: React.FC<{ accountType?: AccountType }> = ({ accountType = 'customer' }) => {
  const [searchParams] = useSearchParams();
  if (accountType === 'entrepreneur') return <EntrepreneurWebNotice />;
  if (searchParams.get('role') === 'entrepreneur') return <Navigate to="/register/entrepreneur" replace />;
  return <CustomerRegisterForm />;
};

export default NativeRegisterPage;
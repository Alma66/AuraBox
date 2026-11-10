import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/config';
import AuthHero from '../../components/native/AuthHero';
import { User } from '../../types/user';
import { getErrorMessage } from '../../utils/format';
import { tapFeedback } from '../../utils/native';
import { userFromToken } from '../../utils/session';

interface NativeLoginPageProps {
  onLogin: (user: User) => Promise<User>;
}

const NativeLoginPage: React.FC<NativeLoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const reason = new URLSearchParams(location.search).get('reason');

  const getRedirectTarget = (): string | null => {
    const redirect = new URLSearchParams(location.search).get('redirect');
    if (!redirect) return null;
    if (!redirect.startsWith('/') || redirect.startsWith('//')) return null;
    return redirect;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Ingresá tu email y tu contraseña.');
      return;
    }
    tapFeedback();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email: cleanEmail, password });
      const data = response.data?.data ?? response.data;
      const { access_token } = data;
      localStorage.setItem('access_token', access_token);
      const user = await onLogin(userFromToken(access_token));

      if (user.role === 'entrepreneur' && !user.managedClubId) {
        navigate('/register/complete-club', { replace: true });
        return;
      }

      const redirectTarget = getRedirectTarget();
      if (redirectTarget) {
        navigate(redirectTarget, { replace: true });
        return;
      }

      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
        return;
      }

      navigate('/', { replace: true, state: { showWelcome: true, welcomeName: user.firstName } });
    } catch (err: any) {
      if (err?.response?.status === 429) {
        setError('Demasiados intentos. Esperá un minuto e intentá de nuevo.');
      } else {
        setError(getErrorMessage(err, 'No pudimos iniciar sesión. Verificá tus datos.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-aurora-cream">
      <AuthHero title="Bienvenido de nuevo" subtitle="Ingresá para ver tus cajas y tus pedidos." />

      <div className="relative -mt-8 rounded-t-[2rem] bg-aurora-cream px-4 pb-10 pt-6">
        {reason === 'disabled' && (
          <p role="alert" className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            Tu cuenta fue deshabilitada. Si creés que es un error, contactá al equipo de AuraBox.
          </p>
        )}
        {reason === 'expired' && (
          <p role="status" className="mb-4 rounded-2xl bg-aurora-gold/15 px-4 py-3 text-sm text-aurora-navy ring-1 ring-aurora-gold/30">
            Tu sesión expiró. Iniciá sesión de nuevo para continuar.
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-1 block text-sm font-bold text-aurora-navy">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="next"
              placeholder="tu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input-aurora !py-3.5 !text-base"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1 block text-sm font-bold text-aurora-navy">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                autoCapitalize="none"
                enterKeyHint="go"
                placeholder="Tu contraseña"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="input-aurora !py-3.5 !pr-24 !text-base"
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
          </div>

          {error && (
            <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary min-h-[52px] w-full !text-base disabled:opacity-60">
            {loading ? 'Ingresando…' : 'Iniciar sesión'}
          </button>

          <p className="text-center text-sm text-aurora-navy/60">
            ¿Olvidaste tu contraseña?{' '}
            <Link to="/contact" className="font-semibold text-aurora-terracotta">
              Escribinos
            </Link>
          </p>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-aurora-navy/35">
          <span className="h-px flex-1 bg-aurora-navy/10" />
          o
          <span className="h-px flex-1 bg-aurora-navy/10" />
        </div>

        <Link
          to="/register"
          onClick={() => {
            tapFeedback();
          }}
          className="btn-outline min-h-[52px] w-full !text-base"
        >
          Crear una cuenta
        </Link>
        <Link to="/explore" className="mt-4 block text-center text-sm font-semibold text-aurora-navy/60">
          Seguir explorando sin cuenta
        </Link>
      </div>
    </div>
  );
};

export default NativeLoginPage;
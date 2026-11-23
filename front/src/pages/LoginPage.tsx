import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/config';
import { User } from '../types/user';
import { userFromToken } from '../utils/session';
import AuthLayout from '../components/common/AuthLayout';

interface LoginPageProps {
  onLogin: (user: User) => Promise<User>;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const reason = new URLSearchParams(location.search).get('reason');

  const getRedirectTarget = (): string | null => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    if (!redirect) return null;
    if (!redirect.startsWith('/') || redirect.startsWith('//')) return null;
    return redirect;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email: email.trim(), password });
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
        navigate(redirectTarget);
        return;
      }

      switch (user.role) {
        case 'customer':
        case 'entrepreneur':
          navigate('/', { state: { showWelcome: true, welcomeName: user.firstName } });
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          setError('Rol del usuario no reconocido.');
      }
    } catch (err: any) {
      const message = err.response?.data?.message;
      setError(
        Array.isArray(message)
          ? message.join('. ')
          : message || 'Error al iniciar sesión. Verificá tus credenciales.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      panelEyebrow="Bienvenido de vuelta"
      panelTitle="Tu próxima caja ya te espera"
      panelText="Entrá a tu cuenta para ver tus suscripciones, tus pedidos y tus clubes favoritos."
      points={[
        'Tus suscripciones y pedidos en un solo lugar',
        'Seguimiento de tus envíos',
        'Tus clubes y planes favoritos siempre a mano',
      ]}
    >
      <div className="rounded-3xl bg-white p-8 shadow-aurora ring-1 ring-aurora-navy/5 sm:p-10">
        <div className="mb-8">
          <img src="/aurabox-mark.svg" alt="AuraBox" className="mb-5 h-12 w-12 rounded-xl lg:hidden" />
          <h1 className="font-display text-4xl font-medium text-aurora-navy">Iniciá sesión</h1>
          <p className="mt-2 text-sm text-aurora-navy/60">
            ¿No tenés una cuenta?{' '}
            <Link to="/register" className="font-semibold text-aurora-terracotta hover:text-aurora-terracottaDark">
              Registrate acá
            </Link>
          </p>
          {reason === 'disabled' && (
            <p role="alert" className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
              Tu cuenta fue deshabilitada. Si creés que es un error, contactá al equipo de AuraBox.
            </p>
          )}
          {reason === 'expired' && (
            <p role="status" className="mt-4 rounded-xl border border-aurora-gold/30 bg-aurora-gold/10 px-3 py-2 text-sm text-aurora-navy">
              Tu sesión expiró. Iniciá sesión de nuevo para continuar.
            </p>
          )}
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-address" className="mb-1 block text-sm font-medium text-aurora-navy/70">Email</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input-aurora"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-aurora-navy/70 mb-1">Contraseña</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="input-aurora pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-aurora-navy/40 hover:text-aurora-navy"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-red-600 text-sm text-center bg-red-50 border border-red-100 rounded-lg py-2 px-3">{error}</p>
          )}

          <p className="text-center text-sm text-aurora-navy/60">
            ¿Olvidaste tu contraseña?{' '}
            <Link to="/contact" className="font-semibold text-aurora-terracotta hover:text-aurora-terracottaDark">
              Escribinos
            </Link>
          </p>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary btn-shine w-full disabled:opacity-60"
          >
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
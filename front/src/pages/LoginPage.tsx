import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/config';
import { User } from '../types/user';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
      const response = await api.post('/auth/login', { email, password });
      const data = response.data?.data ?? response.data;
      const { access_token } = data;

      localStorage.setItem('access_token', access_token);

      const payload = JSON.parse(atob(access_token.split('.')[1]));

      const user: User = {
        id: payload.sub?.toString() || '',
        firstName: payload.firstName || '',
        lastName: payload.lastName || '',
        email: payload.email || '',
        role: (payload.role?.toLowerCase() || 'customer') as 'customer' | 'entrepreneur' | 'admin',
        registeredDate: payload.registeredDate || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        managedClubId: payload.managedClubId?.toString() || undefined,
      };

      onLogin(user);

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
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verificá tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-aurora-cream py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute -top-32 -left-20 w-96 h-96 bg-aurora-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-aurora-terracotta/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 p-10 card-surface shadow-aurora relative animate-fadeInUp">
        <div>
          <div className="flex justify-center mb-4">
            <img src="/aurabox-logo.png" alt="AuraBox" className="h-14 w-auto" />
          </div>
          <h2 className="text-center font-display text-3xl font-bold text-aurora-navy">
            Bienvenido de nuevo
          </h2>
          <p className="mt-2 text-center text-sm text-aurora-navy/60">
            ¿No tenés una cuenta?{' '}
            <Link to="/register" className="font-semibold text-aurora-terracotta hover:text-aurora-terracottaDark">
              Registrate aquí
            </Link>
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-aurora-navy/70 mb-1">Email</label>
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
            <p className="text-red-600 text-sm text-center bg-red-50 border border-red-100 rounded-lg py-2 px-3">{error}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-aurora-terracotta focus:ring-aurora-terracotta border-aurora-navy/20 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-aurora-navy/70">
                Recordarme
              </label>
            </div>
            <div className="text-sm">
              <button type="button" className="font-medium text-aurora-terracotta hover:text-aurora-terracottaDark">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
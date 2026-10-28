import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../App';
import Icon from '../../entrepreneur/layout/Icon';
import { ADMIN_SECTIONS, resolveAdminSection } from '../../../config/adminNav';

interface AdminLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, onLogout }) => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const active = resolveAdminSection(pathname);
  const initial = (user?.firstName?.[0] ?? 'A').toUpperCase();
  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Administrador';

  useEffect(() => {
    setUserMenuOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-aurora-cream">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-aurora-navy text-aurora-cream lg:flex">
        <div className="flex h-16 flex-shrink-0 items-center gap-3 border-b border-white/10 px-4">
          <Link to="/admin/dashboard" className="flex items-center gap-3" aria-label="Ir al resumen">
            <img src="/logo192.png" alt="AuraBox" className="h-9 w-9 rounded-lg" />
            <span className="leading-tight">
              <span className="block font-display text-lg font-bold text-white">AuraBox</span>
              <span className="block text-[11px] uppercase tracking-widest text-aurora-gold">Administración</span>
            </span>
          </Link>
        </div>

        <nav aria-label="Panel del administrador" className="mt-4 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {ADMIN_SECTIONS.map((section) => {
            const isActive = active?.id === section.id;
            return (
              <Link
                key={section.id}
                to={section.to}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-gold ${
                  isActive ? 'bg-white/10 text-white' : 'text-aurora-cream/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {isActive && <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r bg-aurora-gold" />}
                <Icon name={section.icon} className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{section.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex-shrink-0 border-t border-white/10 p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-aurora-cream/60 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Icon name="chevronLeft" className="h-5 w-5 flex-shrink-0" />
            <span>Ver sitio público</span>
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-aurora-navy/10 bg-aurora-cream/90 px-4 backdrop-blur lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/admin/dashboard" className="lg:hidden" aria-label="Ir al resumen">
              <img src="/logo192.png" alt="AuraBox" className="h-8 w-8 rounded-lg" />
            </Link>
            <p className="truncate font-display text-lg font-bold text-aurora-navy">{active ? active.label : 'Administración'}</p>
          </div>
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((current) => !current)}
              aria-haspopup="true"
              aria-expanded={userMenuOpen}
              aria-label="Menú de usuario"
              className="flex min-h-[44px] items-center gap-1 rounded-full pl-1 pr-2 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-terracotta"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-aurora-navy font-display text-sm font-bold text-aurora-cream">
                {initial}
              </span>
              <Icon name="chevronDown" className="h-4 w-4 text-aurora-navy/50" />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-aurora-navy/5 bg-white py-1 shadow-aurora">
                <div className="border-b border-aurora-navy/10 px-4 py-3">
                  <p className="truncate text-sm font-semibold text-aurora-navy">{fullName}</p>
                  <p className="truncate text-xs text-aurora-navy/50">{user?.email}</p>
                </div>
                <Link to="/" className="flex min-h-[44px] items-center gap-3 px-4 text-sm text-aurora-navy/80 hover:bg-aurora-cream">
                  <Icon name="user" className="h-4 w-4" />
                  Ver sitio público
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex min-h-[44px] w-full items-center gap-3 px-4 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <Icon name="logout" className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="min-h-[calc(100vh-56px)] pb-24 focus:outline-none lg:pb-8">
          {children}
        </main>
      </div>

      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-aurora-navy/10 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="flex overflow-x-auto">
          {ADMIN_SECTIONS.map((section) => {
            const isActive = active?.id === section.id;
            return (
              <li key={section.id} className="min-w-[84px] flex-1">
                <Link
                  to={section.to}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${
                    isActive ? 'text-aurora-terracotta' : 'text-aurora-navy/60'
                  }`}
                >
                  <Icon name={section.icon} className="h-6 w-6" />
                  {section.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default AdminLayout;
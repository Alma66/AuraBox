import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../api/config';
import { useAuth } from '../../../App';
import Icon from './Icon';
import CommandPalette from './CommandPalette';
import { ENTREPRENEUR_SECTIONS, resolveActiveNav, sectionHref } from '../../../config/entrepreneurNav';

interface EntrepreneurLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

interface ClubInfo {
  name: string;
  logoUrl?: string;
}

const COLLAPSE_KEY = 'aurabox_panel_collapsed';

const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
};

const fallbackTitle = (pathname: string) => {
  if (pathname.startsWith('/entrepreneur/profile')) return 'Mi perfil';
  if (pathname.startsWith('/faq')) return 'Preguntas frecuentes';
  if (pathname.startsWith('/contact')) return 'Contacto';
  if (pathname.includes('/manage-users-roles')) return 'Usuarios y roles';
  return 'Panel';
};

const EntrepreneurLayout: React.FC<EntrepreneurLayoutProps> = ({ children, onLogout }) => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const clubId = user?.managedClubId ?? '';
  const [collapsed, setCollapsed] = useState<boolean>(readCollapsed);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [club, setClub] = useState<ClubInfo | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const active = useMemo(() => resolveActiveNav(pathname, clubId), [pathname, clubId]);
  const title = active.section ? active.section.label : fallbackTitle(pathname);
  const mobilePrimary = ENTREPRENEUR_SECTIONS.filter((section) => section.mobilePrimary);
  const activeIsPrimary = !!active.section && !!active.section.mobilePrimary;
  const initial = (user?.firstName?.[0] ?? 'E').toUpperCase();
  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Emprendedor';

  useEffect(() => {
    if (!clubId) {
      setClub(null);
      return;
    }
    let cancelled = false;
    setLogoFailed(false);
    api
      .get(`/clubs/${clubId}`)
      .then((res: any) => {
        if (cancelled) return;
        const data = getResponseData(res);
        setClub({ name: data?.name ?? 'Mi club', logoUrl: data?.logoUrl });
      })
      .catch(() => {
        if (!cancelled) setClub(null);
      });
    return () => {
      cancelled = true;
    };
  }, [clubId]);

  useEffect(() => {
    setMoreOpen(false);
    setUserMenuOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
    } catch {}
  }, [collapsed]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((current) => !current);
      } else if (event.key === 'Escape') {
        setMoreOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const sidebarItemClass = (isActive: boolean) =>
    `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-gold ${
      isActive ? 'bg-white/10 text-white' : 'text-aurora-cream/70 hover:bg-white/5 hover:text-white'
    } ${collapsed ? 'justify-center' : ''}`;

  const clubAvatar = (
    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-aurora-terracotta text-sm font-bold text-white">
      {club?.logoUrl && !logoFailed ? (
        <img
          src={club.logoUrl}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setLogoFailed(true)}
        />
      ) : (
        (club?.name?.[0] ?? 'C').toUpperCase()
      )}
    </span>
  );

  return (
    <div className="min-h-screen bg-aurora-cream">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col bg-aurora-navy text-aurora-cream transition-[width] duration-200 lg:flex ${
          collapsed ? 'w-[76px]' : 'w-64'
        }`}
      >
        <div className={`flex h-16 flex-shrink-0 items-center gap-3 border-b border-white/10 px-4 ${collapsed ? 'justify-center' : ''}`}>
          <Link to="/entrepreneur/dashboard" className="flex items-center gap-3" aria-label="Ir al resumen">
            <img src="/logo192.png" alt="AuraBox" className="h-9 w-9 rounded-lg" />
            {!collapsed && (
              <span className="leading-tight">
                <span className="block font-display text-lg font-bold text-white">AuraBox</span>
                <span className="block text-[11px] uppercase tracking-widest text-aurora-gold">Panel de club</span>
              </span>
            )}
          </Link>
        </div>

        {clubId && (
          <div className={`mx-3 mt-4 flex items-center gap-3 rounded-xl bg-white/5 p-2 ${collapsed ? 'justify-center' : ''}`}>
            {clubAvatar}
            {!collapsed && (
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-sm font-semibold text-white">{club?.name ?? 'Mi club'}</span>
                <span className="block text-[11px] text-aurora-cream/50">Tu club</span>
              </span>
            )}
          </div>
        )}

        <nav aria-label="Panel del emprendedor" className="mt-4 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {ENTREPRENEUR_SECTIONS.map((section) => {
            const isActive = active.section?.id === section.id;
            return (
              <Link
                key={section.id}
                to={sectionHref(section, clubId)}
                title={collapsed ? section.label : undefined}
                aria-current={isActive ? 'page' : undefined}
                className={sidebarItemClass(isActive)}
              >
                {isActive && <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r bg-aurora-gold" />}
                <Icon name={section.icon} className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="truncate">{section.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="flex-shrink-0 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-aurora-cream/60 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-gold ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Contraer</span>}
          </button>
        </div>
      </aside>

      <div className={collapsed ? 'lg:pl-[76px]' : 'lg:pl-64'}>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-aurora-navy/10 bg-aurora-cream/90 px-4 backdrop-blur lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/entrepreneur/dashboard" className="lg:hidden" aria-label="Ir al resumen">
              <img src="/logo192.png" alt="AuraBox" className="h-8 w-8 rounded-lg" />
            </Link>
            <p className="truncate font-display text-lg font-bold text-aurora-navy">{title}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Buscar en el panel"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl border border-aurora-navy/15 bg-white px-3 text-sm text-aurora-navy/60 transition-colors hover:border-aurora-navy/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-terracotta md:min-w-0"
            >
              <Icon name="search" className="h-4 w-4" />
              <span className="hidden md:inline">Ir a…</span>
              <kbd className="hidden rounded-md border border-aurora-navy/15 px-1.5 py-0.5 text-[11px] md:inline">Ctrl K</kbd>
            </button>
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
                  <Link
                    to="/entrepreneur/profile"
                    className="flex min-h-[44px] items-center gap-3 px-4 text-sm text-aurora-navy/80 hover:bg-aurora-cream"
                  >
                    <Icon name="user" className="h-4 w-4" />
                    Mi perfil
                  </Link>
                  <Link
                    to="/faq"
                    className="flex min-h-[44px] items-center gap-3 px-4 text-sm text-aurora-navy/80 hover:bg-aurora-cream"
                  >
                    <Icon name="help" className="h-4 w-4" />
                    Ayuda
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
          </div>
        </header>

        {active.section && active.section.tabs.length > 1 && (
          <nav
            aria-label={`Secciones de ${active.section.label}`}
            className="sticky top-14 z-20 overflow-x-auto border-b border-aurora-navy/10 bg-white/80 px-4 backdrop-blur lg:px-8"
          >
            <ul className="flex min-w-max gap-1">
              {active.section.tabs.map((tab) => {
                const isActive = active.tab?.id === tab.id;
                return (
                  <li key={tab.id}>
                    <Link
                      to={tab.to(clubId)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex min-h-[44px] items-center border-b-2 px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:bg-aurora-cream ${
                        isActive
                          ? 'border-aurora-terracotta text-aurora-terracotta'
                          : 'border-transparent text-aurora-navy/60 hover:text-aurora-navy'
                      }`}
                    >
                      {tab.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}

        <main id="main-content" tabIndex={-1} className="min-h-[calc(100vh-56px)] pb-24 focus:outline-none lg:pb-8">
          {!clubId && (
            <div className="m-4 rounded-xl border border-aurora-gold/40 bg-aurora-gold/10 p-4 text-sm text-aurora-navy lg:mx-8">
              Tu cuenta todavía no tiene un club asociado. Completá el registro de tu club para usar el panel.
            </div>
          )}
          {children}
        </main>
      </div>

      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-aurora-navy/10 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {mobilePrimary.map((section) => {
            const isActive = active.section?.id === section.id;
            return (
              <li key={section.id}>
                <Link
                  to={sectionHref(section, clubId)}
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
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              className={`flex min-h-[56px] w-full flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${
                !activeIsPrimary && active.section ? 'text-aurora-terracotta' : 'text-aurora-navy/60'
              }`}
            >
              <Icon name="more" className="h-6 w-6" />
              Más
            </button>
          </li>
        </ul>
      </nav>

      {moreOpen && (
        <div
          className="fixed inset-0 z-50 bg-aurora-navyDark/50 lg:hidden"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setMoreOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Todas las secciones"
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-3">
                {clubAvatar}
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-sm font-semibold text-aurora-navy">{club?.name ?? 'Mi club'}</p>
                  <p className="text-xs text-aurora-navy/50">{fullName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Cerrar"
                className="flex h-11 w-11 items-center justify-center rounded-full text-aurora-navy/60 hover:bg-aurora-cream"
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {ENTREPRENEUR_SECTIONS.map((section) => {
                const isActive = active.section?.id === section.id;
                return (
                  <Link
                    key={section.id}
                    to={sectionHref(section, clubId)}
                    className={`flex min-h-[84px] flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-center text-xs font-semibold ${
                      isActive
                        ? 'border-aurora-terracotta bg-aurora-terracotta/10 text-aurora-terracotta'
                        : 'border-aurora-navy/10 text-aurora-navy/80'
                    }`}
                  >
                    <Icon name={section.icon} className="h-6 w-6" />
                    {section.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-4 divide-y divide-aurora-navy/10 rounded-2xl border border-aurora-navy/10">
              <Link to="/entrepreneur/profile" className="flex min-h-[48px] items-center gap-3 px-4 text-sm font-semibold text-aurora-navy">
                <Icon name="user" className="h-5 w-5" />
                Mi perfil
              </Link>
              <Link to="/faq" className="flex min-h-[48px] items-center gap-3 px-4 text-sm font-semibold text-aurora-navy">
                <Icon name="help" className="h-5 w-5" />
                Ayuda
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-[48px] w-full items-center gap-3 px-4 text-left text-sm font-semibold text-red-600"
              >
                <Icon name="logout" className="h-5 w-5" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} clubId={clubId} />
    </div>
  );
};

export default EntrepreneurLayout;
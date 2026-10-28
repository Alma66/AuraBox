import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '../../types/user';
import { useAuth } from '../../App';

interface NavbarProps {
  userRole: UserRole | null;
  isAuthenticated: boolean;
  onLogout: () => void;
}

const DropdownArrow: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg
    className={`ml-1 h-4 w-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

const btnClass =
  'flex items-center text-aurora-navy/80 hover:text-aurora-terracotta px-2 py-2 rounded-md text-sm font-semibold whitespace-nowrap transition-colors duration-200';
const linkClass =
  'block px-3 py-2 text-sm text-aurora-navy/80 hover:bg-aurora-cream hover:text-aurora-terracotta rounded-lg transition-colors duration-150';
const mobileLinkClass =
  'text-aurora-navy hover:bg-white hover:text-aurora-terracotta block px-3 py-2 rounded-md text-base font-semibold';
const mobileSubLinkClass = 'block text-sm text-aurora-navy/80 hover:bg-white py-1 rounded';
const iconLinkClass =
  'text-aurora-navy/70 hover:text-aurora-terracotta p-2 rounded-full hover:bg-aurora-cream transition-all duration-200';

const Navbar: React.FC<NavbarProps> = ({ userRole, isAuthenticated, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [isMobileHelpOpen, setIsMobileHelpOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const helpMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const closeAllDropdowns = useCallback(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsHelpMenuOpen(false);
    setIsMobileHelpOpen(false);
  }, []);

  const toggleMobileMenu = () => {
    const next = !isMobileMenuOpen;
    closeAllDropdowns();
    setIsMobileMenuOpen(next);
  };

  const toggleUserMenu = () => {
    const next = !isUserMenuOpen;
    closeAllDropdowns();
    setIsUserMenuOpen(next);
  };

  const toggleHelpMenu = () => {
    const next = !isHelpMenuOpen;
    closeAllDropdowns();
    setIsHelpMenuOpen(next);
  };

  const handleLogoutClick = () => {
    onLogout();
    localStorage.removeItem('access_token');
    closeAllDropdowns();
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setIsUserMenuOpen(false);
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target as Node)) setIsHelpMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeAllDropdowns();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeAllDropdowns]);

  const renderCustomerQuickIcons = () => {
    if (!(isAuthenticated && userRole === 'customer')) return null;
    return (
      <>
        <Link to="/customer/wishlist" className={iconLinkClass} onClick={closeAllDropdowns} aria-label="Mi Lista de Deseos">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </Link>
        <Link to="/cart" className={iconLinkClass} onClick={closeAllDropdowns} aria-label="Mi Carrito">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 7.5M7 13l-1.5 7.5M17 13l1.5 7.5M17 13l4-8m-8 4h8M9 4h6m-6 0h6a2 2 0 002-2V2a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
          </svg>
        </Link>
      </>
    );
  };

  const renderAuthButtons = () => {
    if (isAuthenticated) {
      return (
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={toggleUserMenu}
            aria-haspopup="true"
            aria-expanded={isUserMenuOpen}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-aurora-navy transition-colors duration-200 hover:bg-aurora-cream hover:text-aurora-terracotta focus:outline-none"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-aurora-navy font-display text-sm font-bold text-aurora-cream">
              {(user?.firstName?.[0] || 'A').toUpperCase()}
            </span>
            <DropdownArrow isOpen={isUserMenuOpen} />
          </button>
          {isUserMenuOpen && (
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-aurora-navy/5 bg-white py-2 shadow-aurora">
              {userRole === 'customer' && (
                <>
                  <Link to="/customer/profile" className={linkClass} onClick={closeAllDropdowns}>Mi Perfil</Link>
                  <Link to="/customer/subscriptions" className={linkClass} onClick={closeAllDropdowns}>Mis Suscripciones</Link>
                  <Link to="/customer/orders" className={linkClass} onClick={closeAllDropdowns}>Historial de Compras</Link>
                  <Link to="/customer/reviews" className={linkClass} onClick={closeAllDropdowns}>Mis Reseñas</Link>
                </>
              )}
              {userRole === 'entrepreneur' && (
                <>
                  <Link to="/entrepreneur/dashboard" className={linkClass} onClick={closeAllDropdowns}>Ir a mi panel</Link>
                  <Link to="/entrepreneur/profile" className={linkClass} onClick={closeAllDropdowns}>Mi Perfil</Link>
                </>
              )}
              <div className="my-1 border-t border-aurora-navy/5" />
              <button
                onClick={handleLogoutClick}
                className="mx-1 block w-full rounded-lg px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <Link to="/login" className="px-3 py-2 text-sm font-semibold text-aurora-navy transition-colors duration-200 hover:text-aurora-terracotta">
          Iniciar Sesión
        </Link>
        <Link to="/register" className="btn-primary !px-5 !py-2 text-sm">
          Registrate
        </Link>
      </div>
    );
  };

  return (
    <nav
      className={`sticky top-0 z-50 border-b bg-aurora-cream/95 backdrop-blur-md transition-shadow duration-300 ${
        isScrolled ? 'border-aurora-navy/10 shadow-aurora-sm' : 'border-transparent'
      }`}
    >
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0 pl-2">
            <Link to="/" onClick={closeAllDropdowns} className="flex items-center gap-2">
              <img className="h-9 w-auto" src="/logo192.png" alt="AuraBox" />
              <span className="hidden font-display text-xl font-bold tracking-tight text-aurora-navy sm:block">AuraBox</span>
            </Link>
          </div>

          <div className="hidden flex-1 justify-center md:flex md:items-center md:gap-x-1">
            <Link to="/explore" className={btnClass} onClick={closeAllDropdowns}>
              Explorar Clubes
            </Link>
            <div className="relative" ref={helpMenuRef}>
              <button onClick={toggleHelpMenu} aria-haspopup="true" aria-expanded={isHelpMenuOpen} className={btnClass}>
                Ayuda <DropdownArrow isOpen={isHelpMenuOpen} />
              </button>
              {isHelpMenuOpen && (
                <div className="absolute left-0 z-20 mt-2 w-48 rounded-xl border border-aurora-navy/5 bg-white py-2 shadow-aurora">
                  <Link to="/faq" className={linkClass} onClick={closeAllDropdowns}>FAQ</Link>
                  <Link to="/contact" className={linkClass} onClick={closeAllDropdowns}>Contacto</Link>
                </div>
              )}
            </div>
            <Link to="/about-us" className={btnClass} onClick={closeAllDropdowns}>
              Sobre Nosotros
            </Link>
          </div>

          <div className="flex items-center gap-x-2 pr-2">
            <div className="hidden md:flex md:items-center md:gap-x-1">
              {renderCustomerQuickIcons()}
              {renderAuthButtons()}
            </div>
            <div className="flex md:hidden">
              <button
                onClick={toggleMobileMenu}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu-panel"
                className="inline-flex items-center justify-center rounded-md p-2 text-aurora-navy hover:bg-aurora-navy/5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-aurora-terracotta"
              >
                <span className="sr-only">Abrir menú principal</span>
                {isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          id="mobile-menu-panel"
          className="absolute left-0 top-16 z-40 max-h-[calc(100vh-64px)] w-full overflow-y-auto border-t border-aurora-navy/10 bg-aurora-cream py-2 shadow-aurora md:hidden"
        >
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            <Link to="/explore" className={mobileLinkClass} onClick={closeAllDropdowns}>
              Explorar Clubes
            </Link>
            <button
              onClick={() => setIsMobileHelpOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-base font-semibold text-aurora-navy hover:bg-white hover:text-aurora-terracotta"
            >
              Ayuda <DropdownArrow isOpen={isMobileHelpOpen} />
            </button>
            {isMobileHelpOpen && (
              <div className="space-y-1 py-1 pl-6 pr-3">
                <Link to="/faq" className={mobileSubLinkClass} onClick={closeAllDropdowns}>FAQ</Link>
                <Link to="/contact" className={mobileSubLinkClass} onClick={closeAllDropdowns}>Contacto</Link>
              </div>
            )}
            <Link to="/about-us" className={mobileLinkClass} onClick={closeAllDropdowns}>
              Sobre Nosotros
            </Link>
            {isAuthenticated ? (
              <>
                {userRole === 'customer' && (
                  <>
                    <Link to="/customer/profile" className={mobileLinkClass} onClick={closeAllDropdowns}>Mi Perfil</Link>
                    <Link to="/customer/subscriptions" className={mobileLinkClass} onClick={closeAllDropdowns}>Mis Suscripciones</Link>
                    <Link to="/customer/orders" className={mobileLinkClass} onClick={closeAllDropdowns}>Historial de Compras</Link>
                    <Link to="/customer/reviews" className={mobileLinkClass} onClick={closeAllDropdowns}>Mis Reseñas</Link>
                    <Link to="/customer/wishlist" className={mobileLinkClass} onClick={closeAllDropdowns}>Wishlist</Link>
                    <Link to="/cart" className={mobileLinkClass} onClick={closeAllDropdowns}>Carrito</Link>
                  </>
                )}
                {userRole === 'entrepreneur' && (
                  <>
                    <Link to="/entrepreneur/dashboard" className={mobileLinkClass} onClick={closeAllDropdowns}>Ir a mi panel</Link>
                    <Link to="/entrepreneur/profile" className={mobileLinkClass} onClick={closeAllDropdowns}>Mi Perfil</Link>
                  </>
                )}
                <button
                  onClick={handleLogoutClick}
                  className="block w-full rounded-md px-3 py-2 text-left text-base font-semibold text-red-600 hover:bg-red-50"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={mobileLinkClass} onClick={closeAllDropdowns}>Iniciar Sesión</Link>
                <Link
                  to="/register"
                  className="mt-1 block rounded-md bg-aurora-terracotta px-3 py-2 text-center text-base font-semibold text-white"
                  onClick={closeAllDropdowns}
                >
                  Registrate
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
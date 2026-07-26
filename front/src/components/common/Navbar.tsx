import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '../../types/user';
import { useAuth } from '../../App';
interface NavbarProps {
  userRole: UserRole | null;
  isAuthenticated: boolean;
  onLogout: () => void;
}
const Navbar: React.FC<NavbarProps> = ({ userRole, isAuthenticated, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [isClubMenuOpen, setIsClubMenuOpen] = useState(false);
  const [isGestionMenuOpen, setIsGestionMenuOpen] = useState(false);
  const [isOperationsMenuOpen, setIsOperationsMenuOpen] = useState(false);
  const [isMarketingCommMenuOpen, setIsMarketingCommMenuOpen] = useState(false);
  const [isAdminToolsMenuOpen, setIsAdminToolsMenuOpen] = useState(false);
  const [isMobileSubMenuOpen, setIsMobileSubMenuOpen] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const helpMenuRef = useRef<HTMLDivElement>(null);
  const clubMenuRef = useRef<HTMLDivElement>(null);
  const gestionMenuRef = useRef<HTMLDivElement>(null);
  const operationsMenuRef = useRef<HTMLDivElement>(null);
  const marketingCommMenuRef = useRef<HTMLDivElement>(null);
  const adminToolsMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const closeAllDropdowns = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsHelpMenuOpen(false);
    setIsClubMenuOpen(false);
    setIsGestionMenuOpen(false);
    setIsOperationsMenuOpen(false);
    setIsMarketingCommMenuOpen(false);
    setIsAdminToolsMenuOpen(false);
    setIsMobileSubMenuOpen(null);
  };
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
  const toggleClubMenu = () => {
    const next = !isClubMenuOpen;
    closeAllDropdowns();
    setIsClubMenuOpen(next);
  };
  const toggleGestionMenu = () => {
    const next = !isGestionMenuOpen;
    closeAllDropdowns();
    setIsGestionMenuOpen(next);
  };
  const toggleOperationsMenu = () => {
    const next = !isOperationsMenuOpen;
    closeAllDropdowns();
    setIsOperationsMenuOpen(next);
  };
  const toggleMarketingCommMenu = () => {
    const next = !isMarketingCommMenuOpen;
    closeAllDropdowns();
    setIsMarketingCommMenuOpen(next);
  };
  const toggleAdminToolsMenu = () => {
    const next = !isAdminToolsMenuOpen;
    closeAllDropdowns();
    setIsAdminToolsMenuOpen(next);
  };
  const toggleMobileSubMenu = (menuName: string) => {
    setIsMobileSubMenuOpen(isMobileSubMenuOpen === menuName ? null : menuName);
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
      if (clubMenuRef.current && !clubMenuRef.current.contains(event.target as Node)) setIsClubMenuOpen(false);
      if (gestionMenuRef.current && !gestionMenuRef.current.contains(event.target as Node)) setIsGestionMenuOpen(false);
      if (operationsMenuRef.current && !operationsMenuRef.current.contains(event.target as Node)) setIsOperationsMenuOpen(false);
      if (marketingCommMenuRef.current && !marketingCommMenuRef.current.contains(event.target as Node)) setIsMarketingCommMenuOpen(false);
      if (adminToolsMenuRef.current && !adminToolsMenuRef.current.contains(event.target as Node)) setIsAdminToolsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const DropdownArrow = ({ isOpen }: { isOpen: boolean }) => (
    <svg
      className={`w-4 h-4 ml-1 transform ${isOpen ? 'rotate-180' : 'rotate-0'} transition-transform duration-200`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  );
  const btnClass = "flex items-center text-aurora-navy/80 hover:text-aurora-terracotta px-2 py-2 rounded-md text-sm font-semibold whitespace-nowrap transition-colors duration-200";
  const linkClass = "block px-3 py-2 text-sm text-aurora-navy/80 hover:bg-aurora-cream hover:text-aurora-terracotta rounded-lg transition-colors duration-150";
  const subTitleClass = "block px-3 py-1 text-xs font-bold text-aurora-terracotta uppercase tracking-wide";
  const renderCustomerQuickIcons = () => {
    if (!(isAuthenticated && userRole === 'customer')) return null;
    return (
      <>
        <Link to="/customer/wishlist" className="text-aurora-navy/70 hover:text-aurora-terracotta p-2 rounded-full hover:bg-aurora-cream transition-all duration-200" onClick={closeAllDropdowns} title="Mi Lista de Deseos">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </Link>
        <Link to="/cart" className="text-aurora-navy/70 hover:text-aurora-terracotta p-2 rounded-full hover:bg-aurora-cream transition-all duration-200" onClick={closeAllDropdowns} title="Mi Carrito">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <button onClick={toggleUserMenu} className="flex items-center gap-2 text-aurora-navy hover:text-aurora-terracotta focus:outline-none pl-1 pr-2 py-1 rounded-full hover:bg-aurora-cream transition-colors duration-200">
            <span className="w-8 h-8 rounded-full bg-aurora-navy text-aurora-cream flex items-center justify-center text-sm font-bold font-display">
              {(user?.firstName?.[0] || 'A').toUpperCase()}
            </span>
            <DropdownArrow isOpen={isUserMenuOpen} />
          </button>
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-aurora border border-aurora-navy/5 py-2 z-20">
              {userRole === 'customer' && (
                <>
                  <Link to="/customer/profile" className={linkClass} onClick={closeAllDropdowns}>Mi Perfil</Link>
                  <Link to="/customer/subscriptions" className={linkClass} onClick={closeAllDropdowns}>Mis Suscripciones</Link>
                  <Link to="/customer/orders" className={linkClass} onClick={closeAllDropdowns}>Historial de Compras</Link>
                  <Link to="/customer/reviews" className={linkClass} onClick={closeAllDropdowns}>Mis Reseñas</Link>
                </>
              )}
              {userRole === 'entrepreneur' && (
                <Link to="/entrepreneur/profile" className={linkClass} onClick={closeAllDropdowns}>Mi Perfil</Link>
              )}
              {userRole === 'admin' && (
                <Link to="/admin/dashboard" className={linkClass} onClick={closeAllDropdowns}>Dashboard Admin</Link>
              )}
              <div className="my-1 border-t border-aurora-navy/5" />
              <button onClick={handleLogoutClick} className="block w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg mx-1">
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <Link to="/login" className="text-sm font-semibold text-aurora-navy hover:text-aurora-terracotta px-3 py-2 transition-colors duration-200">
          Iniciar Sesión
        </Link>
        <Link to="/register" className="btn-primary !px-5 !py-2 text-sm">
          Registrate
        </Link>
      </div>
    );
  };
  const isEntrepreneur = isAuthenticated && userRole === 'entrepreneur';
  const renderEntrepreneurDesktopMenus = () => {
    if (!isEntrepreneur) return null;
    const clubId = user?.managedClubId ?? '';
    return (
      <>
        <div className="relative" ref={clubMenuRef}>
          <button onClick={toggleClubMenu} className={btnClass}>
            Club <DropdownArrow isOpen={isClubMenuOpen} />
          </button>
          {isClubMenuOpen && (
            <div className="absolute left-0 mt-2 w-96 bg-white rounded-xl shadow-aurora border border-aurora-navy/5 py-3 z-20 grid grid-cols-2 gap-x-2 px-3">
              <div>
                <p className={subTitleClass}>Mi Club</p>
                <Link to={`/club/${clubId}`} className={linkClass} onClick={closeAllDropdowns}>Perfil del Club</Link>
                <Link to={`/club/${clubId}/history`} className={linkClass} onClick={closeAllDropdowns}>Historia del Club</Link>
                <Link to={`/entrepreneur/club/${clubId}/edit-subscriptions`} className={linkClass} onClick={closeAllDropdowns}>Gestionar Suscripciones</Link>
                <Link to={`/entrepreneur/club/${clubId}/subscription-boxes`} className={linkClass} onClick={closeAllDropdowns}>Contenido de Cajas</Link>
              </div>
              <div>
                <p className={subTitleClass}>Legal</p>
                <Link to={`/entrepreneur/club/${clubId}/edit-legal-info/terms`} className={linkClass} onClick={closeAllDropdowns}>Términos y Condiciones</Link>
                <Link to={`/entrepreneur/club/${clubId}/edit-legal-info/privacy`} className={linkClass} onClick={closeAllDropdowns}>Política de Seguridad</Link>
                <Link to={`/entrepreneur/club/${clubId}/legal-compliance`} className={linkClass} onClick={closeAllDropdowns}>Cumplimiento Legal</Link>
              </div>
            </div>
          )}
        </div>
        <div className="relative" ref={gestionMenuRef}>
          <button onClick={toggleGestionMenu} className={btnClass}>
            Gestión y Finanzas <DropdownArrow isOpen={isGestionMenuOpen} />
          </button>
          {isGestionMenuOpen && (
            <div className="absolute left-0 mt-2 w-96 bg-white rounded-xl shadow-aurora border border-aurora-navy/5 py-3 z-20 grid grid-cols-2 gap-x-2 px-3">
              <div>
                <p className={subTitleClass}>Inventario y Proveedores</p>
                <Link to={`/entrepreneur/inventory/stock`} className={linkClass} onClick={closeAllDropdowns}>Stock e Insumos</Link>
                <Link to={`/entrepreneur/inventory/proveedores`} className={linkClass} onClick={closeAllDropdowns}>Proveedores</Link>
                <Link to={`/entrepreneur/inventory/pedidos`} className={linkClass} onClick={closeAllDropdowns}>Pedidos a Proveedores</Link>
                <Link to={`/entrepreneur/inventory/categorias`} className={linkClass} onClick={closeAllDropdowns}>Categorías de Insumos</Link>
              </div>
              <div>
                <p className={subTitleClass}>Finanzas</p>
                <Link to={`/entrepreneur/club/${clubId}/finance/movimientos`} className={linkClass} onClick={closeAllDropdowns}>Caja y Movimientos</Link>
                <Link to={`/entrepreneur/club/${clubId}/finance/rentabilidad`} className={linkClass} onClick={closeAllDropdowns}>Costos y Rentabilidad</Link>
              </div>
            </div>
          )}
        </div>
        <div className="relative" ref={operationsMenuRef}>
          <button onClick={toggleOperationsMenu} className={btnClass}>
            Operaciones <DropdownArrow isOpen={isOperationsMenuOpen} />
          </button>
          {isOperationsMenuOpen && (
            <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-aurora border border-aurora-navy/5 py-3 z-20 grid grid-cols-2 gap-x-2 px-3">
              <div>
                <p className={subTitleClass}>Clientes</p>
                <Link to={`/entrepreneur/club/${clubId}/active-subscriptions`} className={linkClass} onClick={closeAllDropdowns}>Suscripciones Activas</Link>
                <Link to={`/entrepreneur/club/${clubId}/manage-customers`} className={linkClass} onClick={closeAllDropdowns}>Historial de Clientes</Link>
                <Link to={`/entrepreneur/club/${clubId}/manage-customers`} className={linkClass} onClick={closeAllDropdowns}>Gestionar Clientes</Link>
              </div>
              <div>
                <p className={subTitleClass}>Logística</p>
                <Link to={`/entrepreneur/club/${clubId}/assign-deliveries`} className={linkClass} onClick={closeAllDropdowns}>Asignar Envíos</Link>
                <Link to={`/entrepreneur/club/${clubId}/view-deliveries`} className={linkClass} onClick={closeAllDropdowns}>Ver Envíos del Día</Link>
                <Link to={`/entrepreneur/club/${clubId}/delivery-history`} className={linkClass} onClick={closeAllDropdowns}>Historial de Entregas</Link>
                <Link to={`/entrepreneur/club/${clubId}/manage-riders`} className={linkClass} onClick={closeAllDropdowns}>Gestionar Riders</Link>
              </div>
            </div>
          )}
        </div>
        <div className="relative" ref={marketingCommMenuRef}>
          <button onClick={toggleMarketingCommMenu} className={btnClass}>
            Marketing y Comunicación <DropdownArrow isOpen={isMarketingCommMenuOpen} />
          </button>
          {isMarketingCommMenuOpen && (
            <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-aurora border border-aurora-navy/5 py-3 z-20 grid grid-cols-2 gap-x-2 px-3">
              <div>
                <p className={subTitleClass}>Marketing</p>
                <Link to={`/entrepreneur/club/${clubId}/gestionar-imagenes`} className={linkClass} onClick={closeAllDropdowns}>Imágenes del Club</Link>
                <Link to={`/entrepreneur/club/${clubId}/administrar-promociones`} className={linkClass} onClick={closeAllDropdowns}>Promociones</Link>
                <Link to={`/entrepreneur/club/${clubId}/enviar-newsletters`} className={linkClass} onClick={closeAllDropdowns}>Newsletters</Link>
              </div>
              <div>
                <p className={subTitleClass}>Comunidad</p>
                <Link to={`/entrepreneur/club/${clubId}/moderate-reviews`} className={linkClass} onClick={closeAllDropdowns}>Moderar Reseñas</Link>
                <Link to={`/entrepreneur/club/${clubId}/customer-support`} className={linkClass} onClick={closeAllDropdowns}>Atención Post-Venta</Link>
              </div>
            </div>
          )}
        </div>
        <div className="relative" ref={adminToolsMenuRef}>
          <button onClick={toggleAdminToolsMenu} className={btnClass}>
            Administración <DropdownArrow isOpen={isAdminToolsMenuOpen} />
          </button>
          {isAdminToolsMenuOpen && (
            <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-aurora border border-aurora-navy/5 py-3 z-20 grid grid-cols-2 gap-x-2 px-3">
              <div>
                <p className={subTitleClass}>Análisis y Reportes</p>
                <Link to={`/entrepreneur/club/${clubId}/stats`} className={linkClass} onClick={closeAllDropdowns}>Estadísticas</Link>
                <Link to={`/entrepreneur/club/${clubId}/sales-reports`} className={linkClass} onClick={closeAllDropdowns}>Reportes de Ventas</Link>
                <Link to={`/entrepreneur/club/${clubId}/feedback-trends`} className={linkClass} onClick={closeAllDropdowns}>Feedback y Tendencias</Link>
              </div>
              <div>
                <p className={subTitleClass}>Equipo</p>
                <Link to={`/entrepreneur/club/${clubId}/manage-users-roles`} className={linkClass} onClick={closeAllDropdowns}>Usuarios y Roles</Link>
                <Link to={`/entrepreneur/club/${clubId}/general-settings`} className={linkClass} onClick={closeAllDropdowns}>Ajustes Generales</Link>
              </div>
            </div>
          )}
        </div>
      </>
    );
  };
  const renderEntrepreneurMobileMenus = () => {
    if (!isEntrepreneur) return null;
    const clubId = user?.managedClubId ?? '';
    return (
      <>
        <button onClick={() => toggleMobileSubMenu('club')} className="flex items-center justify-between w-full text-aurora-navy hover:bg-aurora-cream hover:text-aurora-terracotta px-3 py-2 rounded-md text-base font-semibold">
          Club <DropdownArrow isOpen={isMobileSubMenuOpen === 'club'} />
        </button>
        {isMobileSubMenuOpen === 'club' && (
          <div className="pl-6 pr-3 py-1 space-y-1">
            <p className="block text-xs font-bold text-aurora-terracotta uppercase py-1">Mi Club</p>
            <Link to={`/club/${clubId}`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Perfil del Club</Link>
            <Link to={`/club/${clubId}/history`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Historia del Club</Link>
            <Link to={`/entrepreneur/club/${clubId}/edit-subscriptions`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Gestionar Suscripciones</Link>
            <Link to={`/entrepreneur/club/${clubId}/subscription-boxes`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Contenido de Cajas</Link>
            <p className="block text-xs font-bold text-aurora-terracotta uppercase py-1 mt-2">Legal</p>
            <Link to={`/entrepreneur/club/${clubId}/edit-legal-info/terms`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Términos y Condiciones</Link>
            <Link to={`/entrepreneur/club/${clubId}/edit-legal-info/privacy`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Política de Seguridad</Link>
            <Link to={`/entrepreneur/club/${clubId}/legal-compliance`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Cumplimiento Legal</Link>
          </div>
        )}
        <button onClick={() => toggleMobileSubMenu('gestion')} className="flex items-center justify-between w-full text-aurora-navy hover:bg-aurora-cream hover:text-aurora-terracotta px-3 py-2 rounded-md text-base font-semibold">
          Gestión y Finanzas <DropdownArrow isOpen={isMobileSubMenuOpen === 'gestion'} />
        </button>
        {isMobileSubMenuOpen === 'gestion' && (
          <div className="pl-6 pr-3 py-1 space-y-1">
            <p className="block text-xs font-bold text-aurora-terracotta uppercase py-1">Inventario y Proveedores</p>
            <Link to={`/entrepreneur/inventory/stock`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Stock e Insumos</Link>
            <Link to={`/entrepreneur/inventory/proveedores`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Proveedores</Link>
            <Link to={`/entrepreneur/inventory/pedidos`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Pedidos a Proveedores</Link>
            <Link to={`/entrepreneur/inventory/categorias`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Categorías de Insumos</Link>
            <p className="block text-xs font-bold text-aurora-terracotta uppercase py-1 mt-2">Finanzas</p>
            <Link to={`/entrepreneur/club/${clubId}/finance/movimientos`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Caja y Movimientos</Link>
            <Link to={`/entrepreneur/club/${clubId}/finance/rentabilidad`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Costos y Rentabilidad</Link>
          </div>
        )}
        <button onClick={() => toggleMobileSubMenu('operations')} className="flex items-center justify-between w-full text-aurora-navy hover:bg-aurora-cream hover:text-aurora-terracotta px-3 py-2 rounded-md text-base font-semibold">
          Operaciones <DropdownArrow isOpen={isMobileSubMenuOpen === 'operations'} />
        </button>
        {isMobileSubMenuOpen === 'operations' && (
          <div className="pl-6 pr-3 py-1 space-y-1">
            <p className="block text-xs font-bold text-aurora-terracotta uppercase py-1">Clientes</p>
            <Link to={`/entrepreneur/club/${clubId}/active-subscriptions`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Suscripciones Activas</Link>
            <Link to={`/entrepreneur/club/${clubId}/manage-customers`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Historial de Clientes</Link>
            <Link to={`/entrepreneur/club/${clubId}/manage-customers`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Gestionar Clientes</Link>
            <p className="block text-xs font-bold text-aurora-terracotta uppercase py-1 mt-2">Logística</p>
            <Link to={`/entrepreneur/club/${clubId}/assign-deliveries`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Asignar Envíos</Link>
            <Link to={`/entrepreneur/club/${clubId}/view-deliveries`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Ver Envíos del Día</Link>
            <Link to={`/entrepreneur/club/${clubId}/delivery-history`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Historial de Entregas</Link>
            <Link to={`/entrepreneur/club/${clubId}/manage-riders`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Gestionar Riders</Link>
          </div>
        )}
        <button onClick={() => toggleMobileSubMenu('marketingComm')} className="flex items-center justify-between w-full text-aurora-navy hover:bg-aurora-cream hover:text-aurora-terracotta px-3 py-2 rounded-md text-base font-semibold">
          Marketing y Comunicación <DropdownArrow isOpen={isMobileSubMenuOpen === 'marketingComm'} />
        </button>
        {isMobileSubMenuOpen === 'marketingComm' && (
          <div className="pl-6 pr-3 py-1 space-y-1">
            <p className="block text-xs font-bold text-aurora-terracotta uppercase py-1">Marketing</p>
            <Link to={`/entrepreneur/club/${clubId}/gestionar-imagenes`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Imágenes del Club</Link>
            <Link to={`/entrepreneur/club/${clubId}/administrar-promociones`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Promociones</Link>
            <Link to={`/entrepreneur/club/${clubId}/enviar-newsletters`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Newsletters</Link>
            <p className="block text-xs font-bold text-aurora-terracotta uppercase py-1 mt-2">Comunidad</p>
            <Link to={`/entrepreneur/club/${clubId}/moderate-reviews`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Moderar Reseñas</Link>
            <Link to={`/entrepreneur/club/${clubId}/customer-support`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Atención Post-Venta</Link>
          </div>
        )}
        <button onClick={() => toggleMobileSubMenu('adminTools')} className="flex items-center justify-between w-full text-aurora-navy hover:bg-aurora-cream hover:text-aurora-terracotta px-3 py-2 rounded-md text-base font-semibold">
          Administración <DropdownArrow isOpen={isMobileSubMenuOpen === 'adminTools'} />
        </button>
        {isMobileSubMenuOpen === 'adminTools' && (
          <div className="pl-6 pr-3 py-1 space-y-1">
            <p className="block text-xs font-bold text-aurora-terracotta uppercase py-1">Análisis y Reportes</p>
            <Link to={`/entrepreneur/club/${clubId}/stats`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Estadísticas</Link>
            <Link to={`/entrepreneur/club/${clubId}/sales-reports`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Reportes de Ventas</Link>
            <Link to={`/entrepreneur/club/${clubId}/feedback-trends`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Feedback y Tendencias</Link>
            <p className="block text-xs font-bold text-aurora-terracotta uppercase py-1 mt-2">Equipo</p>
            <Link to={`/entrepreneur/club/${clubId}/manage-users-roles`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Usuarios y Roles</Link>
            <Link to={`/entrepreneur/club/${clubId}/general-settings`} className="block text-sm text-aurora-navy/80 hover:bg-aurora-cream py-1 rounded" onClick={closeAllDropdowns}>Ajustes Generales</Link>
          </div>
        )}
      </>
    );
  };
  return (
    <nav className={`bg-aurora-cream/95 backdrop-blur-md sticky top-0 z-50 border-b transition-shadow duration-300 ${isScrolled ? 'shadow-aurora-sm border-aurora-navy/10' : 'border-transparent'}`}>
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 pl-2">
            <Link to="/" onClick={closeAllDropdowns} className="flex items-center gap-2">
              <img className="h-9 w-auto" src="/aurabox-logo.png" alt="AuraBox" />
              <span className="hidden sm:block font-display font-bold text-xl text-aurora-navy tracking-tight">AuraBox</span>
            </Link>
          </div>
          <div className="hidden md:flex md:items-center md:gap-x-1 flex-1 justify-center">
            {!isEntrepreneur && (
              <Link to="/explore" className={btnClass} onClick={closeAllDropdowns}>
                Explorar Clubes
              </Link>
            )}
            <div className="relative" ref={helpMenuRef}>
              <button onClick={toggleHelpMenu} className={btnClass}>
                Ayuda <DropdownArrow isOpen={isHelpMenuOpen} />
              </button>
              {isHelpMenuOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-aurora border border-aurora-navy/5 py-2 z-20">
                  <Link to={isEntrepreneur ? "/how-it-works/entrepreneurs" : "/how-it-works/subscribers"} className={linkClass} onClick={closeAllDropdowns}>Cómo Funciona</Link>
                  <Link to="/faq" className={linkClass} onClick={closeAllDropdowns}>FAQ</Link>
                  <Link to="/contact" className={linkClass} onClick={closeAllDropdowns}>Contacto</Link>
                </div>
              )}
            </div>
            {!isEntrepreneur && (
              <Link to="/about-us" className={btnClass} onClick={closeAllDropdowns}>
                Sobre Nosotros
              </Link>
            )}
            {renderEntrepreneurDesktopMenus()}
          </div>
          <div className="flex items-center gap-x-2 pr-2">
            <div className="hidden md:flex md:items-center md:gap-x-1">
              {renderCustomerQuickIcons()}
              {renderAuthButtons()}
            </div>
            <div className="flex md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-aurora-navy hover:bg-aurora-navy/5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-aurora-terracotta"
              >
                <span className="sr-only">Open main menu</span>
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
        <div className="md:hidden absolute top-16 left-0 w-full bg-aurora-cream shadow-aurora py-2 z-40 overflow-y-auto max-h-[calc(100vh-64px)] border-t border-aurora-navy/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {!isEntrepreneur && (
              <Link to="/explore" className="text-aurora-navy hover:bg-white hover:text-aurora-terracotta block px-3 py-2 rounded-md text-base font-semibold" onClick={closeAllDropdowns}>
                Explorar Clubes
              </Link>
            )}
            <button onClick={() => toggleMobileSubMenu('help')} className="flex items-center justify-between w-full text-aurora-navy hover:bg-white hover:text-aurora-terracotta px-3 py-2 rounded-md text-base font-semibold">
              Ayuda <DropdownArrow isOpen={isMobileSubMenuOpen === 'help'} />
            </button>
            {isMobileSubMenuOpen === 'help' && (
              <div className="pl-6 pr-3 py-1 space-y-1">
                <Link to={isEntrepreneur ? "/how-it-works/entrepreneurs" : "/how-it-works/subscribers"} className="block text-sm text-aurora-navy/80 hover:bg-white py-1 rounded" onClick={closeAllDropdowns}>Cómo Funciona</Link>
                <Link to="/faq" className="block text-sm text-aurora-navy/80 hover:bg-white py-1 rounded" onClick={closeAllDropdowns}>FAQ</Link>
                <Link to="/contact" className="block text-sm text-aurora-navy/80 hover:bg-white py-1 rounded" onClick={closeAllDropdowns}>Contacto</Link>
              </div>
            )}
            {!isEntrepreneur && (
              <Link to="/about-us" className="text-aurora-navy hover:bg-white hover:text-aurora-terracotta block px-3 py-2 rounded-md text-base font-semibold" onClick={closeAllDropdowns}>
                Sobre Nosotros
              </Link>
            )}
            {isAuthenticated ? (
              <>
                {userRole === 'customer' && (
                  <>
                    <Link to="/customer/profile" className="text-aurora-navy hover:bg-white hover:text-aurora-terracotta block px-3 py-2 rounded-md text-base font-semibold" onClick={closeAllDropdowns}>Mi Perfil</Link>
                    <Link to="/customer/subscriptions" className="text-aurora-navy hover:bg-white hover:text-aurora-terracotta block px-3 py-2 rounded-md text-base font-semibold" onClick={closeAllDropdowns}>Mis Suscripciones</Link>
                    <Link to="/customer/orders" className="text-aurora-navy hover:bg-white hover:text-aurora-terracotta block px-3 py-2 rounded-md text-base font-semibold" onClick={closeAllDropdowns}>Historial de Compras</Link>
                    <Link to="/customer/reviews" className="text-aurora-navy hover:bg-white hover:text-aurora-terracotta block px-3 py-2 rounded-md text-base font-semibold" onClick={closeAllDropdowns}>Mis Reseñas</Link>
                    <Link to="/customer/wishlist" className="text-aurora-navy hover:bg-white hover:text-aurora-terracotta block px-3 py-2 rounded-md text-base font-semibold" onClick={closeAllDropdowns}>Wishlist</Link>
                    <Link to="/cart" className="text-aurora-navy hover:bg-white hover:text-aurora-terracotta block px-3 py-2 rounded-md text-base font-semibold" onClick={closeAllDropdowns}>Carrito</Link>
                  </>
                )}
                {userRole === 'entrepreneur' && (
                  <>
                    <Link to="/entrepreneur/profile" className="text-aurora-navy hover:bg-white hover:text-aurora-terracotta block px-3 py-2 rounded-md text-base font-semibold" onClick={closeAllDropdowns}>Mi Perfil</Link>
                    {renderEntrepreneurMobileMenus()}
                  </>
                )}
                {userRole === 'admin' && (
                  <Link to="/admin/dashboard" className="text-aurora-navy hover:bg-white hover:text-aurora-terracotta block px-3 py-2 rounded-md text-base font-semibold" onClick={closeAllDropdowns}>Dashboard Admin</Link>
                )}
                <button onClick={handleLogoutClick} className="block w-full text-left text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-base font-semibold">
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-aurora-navy hover:bg-white hover:text-aurora-terracotta block px-3 py-2 rounded-md text-base font-semibold" onClick={closeAllDropdowns}>Iniciar Sesión</Link>
                <Link to="/register" className="text-white bg-aurora-terracotta block px-3 py-2 rounded-md text-base font-semibold text-center mt-1" onClick={closeAllDropdowns}>Registrate</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
export default Navbar;
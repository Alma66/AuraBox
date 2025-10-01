// FileName: /components/common/Navbar.tsx
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
  // Eliminado: isHowItWorksMenuOpen ya no es necesario como menú independiente en desktop
  // Nuevo estado para el menú desplegable "Ayuda"
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);

  // Estados para los menús desplegables del emprendedor (Desktop)
  const [isClubManagementMenuOpen, setIsClubManagementMenuOpen] = useState(false);
  const [isOperationsMenuOpen, setIsOperationsMenuOpen] = useState(false);
  const [isMarketingCommMenuOpen, setIsMarketingCommMenuOpen] = useState(false);
  const [isAdminToolsMenuOpen, setIsAdminToolsMenuOpen] = useState(false);

  // Estados para los submenús desplegables dentro del menú móvil
  const [isMobileSubMenuOpen, setIsMobileSubMenuOpen] = useState<string | null>(null);

  // Referencias para detectar clics fuera de los menús
  const userMenuRef = useRef<HTMLDivElement>(null);
  // Eliminado: howItWorksMenuRef ya no es necesario como menú independiente en desktop
  // Nueva referencia para el menú "Ayuda"
  const helpMenuRef = useRef<HTMLDivElement>(null);
  const clubManagementMenuRef = useRef<HTMLDivElement>(null);
  const operationsMenuRef = useRef<HTMLDivElement>(null);
  const marketingCommMenuRef = useRef<HTMLDivElement>(null);
  const adminToolsMenuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  // Función para cerrar todos los menús desplegables (desktop y mobile)
  const closeAllDropdowns = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    // Cierra el nuevo menú "Ayuda"
    setIsHelpMenuOpen(false);
    setIsClubManagementMenuOpen(false);
    setIsOperationsMenuOpen(false);
    setIsMarketingCommMenuOpen(false);
    setIsAdminToolsMenuOpen(false);
    setIsMobileSubMenuOpen(null); // Cierra todos los submenús móviles
  };

  // Toggle para el menú móvil principal (hamburguesa)
  const toggleMobileMenu = () => {
    closeAllDropdowns();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Toggle para el menú de usuario (perfil, logout)
  const toggleUserMenu = () => {
    closeAllDropdowns();
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // Toggle para el menú "Ayuda"
  const toggleHelpMenu = () => {
    closeAllDropdowns();
    setIsHelpMenuOpen(!isHelpMenuOpen);
  };

  // Toggles para los menús desplegables del emprendedor (desktop)
  const toggleClubManagementMenu = () => {
    closeAllDropdowns();
    setIsClubManagementMenuOpen(!isClubManagementMenuOpen);
  };

  const toggleOperationsMenu = () => {
    closeAllDropdowns();
    setIsOperationsMenuOpen(!isOperationsMenuOpen);
  };

  const toggleMarketingCommMenu = () => {
    closeAllDropdowns();
    setIsMarketingCommMenuOpen(!isMarketingCommMenuOpen);
  };

  const toggleAdminToolsMenu = () => {
    closeAllDropdowns();
    setIsAdminToolsMenuOpen(!isAdminToolsMenuOpen);
  };

  // Toggle para los submenús dentro del menú móvil
  const toggleMobileSubMenu = (menuName: string) => {
    setIsMobileSubMenuOpen(isMobileSubMenuOpen === menuName ? null : menuName);
  };

  const handleLogoutClick = () => {
    onLogout();
    closeAllDropdowns();
    navigate('/');
  };

  // Hook para cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      // Cierra el menú "Ayuda" al hacer clic fuera
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target as Node)) {
        setIsHelpMenuOpen(false);
      }
      if (clubManagementMenuRef.current && !clubManagementMenuRef.current.contains(event.target as Node)) {
        setIsClubManagementMenuOpen(false);
      }
      if (operationsMenuRef.current && !operationsMenuRef.current.contains(event.target as Node)) {
        setIsOperationsMenuOpen(false);
      }
      if (marketingCommMenuRef.current && !marketingCommMenuRef.current.contains(event.target as Node)) {
        setIsMarketingCommMenuOpen(false);
      }
      if (adminToolsMenuRef.current && !adminToolsMenuRef.current.contains(event.target as Node)) {
        setIsAdminToolsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Componente auxiliar para la flecha del dropdown
  const DropdownArrow = ({ isOpen }: { isOpen: boolean }) => (
    <svg
      className={`w-4 h-4 ml-1 transform ${isOpen ? 'rotate-180' : 'rotate-0'} transition-transform duration-200`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
    </svg>
  );

  // Renderiza los botones de autenticación (Iniciar Sesión / Registrarse / Perfil)
  const renderAuthButtons = () => {
    if (isAuthenticated) {
      return (
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={toggleUserMenu}
            className="flex items-center text-gray-700 hover:text-blue-600 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <DropdownArrow isOpen={isUserMenuOpen} />
          </button>
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
              {userRole === 'customer' && (
                <>
                  <Link
                    to="/customer/profile" // Corregido: Asegura que apunte a la ruta correcta del perfil del cliente
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeAllDropdowns}
                  >
                    Mi Perfil
                  </Link>
                  <Link
                    to="/customer/reviews"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeAllDropdowns}
                  >
                    Mis Reseñas
                  </Link>
                </>
              )}

              {userRole === 'entrepreneur' && (
                <>
                  <Link
                    to="/entrepreneur/profile" // Consolidado: Ahora solo hay una opción "Mi Perfil" para emprendedores
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeAllDropdowns}
                  >
                    Mi Perfil
                  </Link>
                  {/* Se elimina el enlace a /entrepreneur/dashboard aquí */}
                </>
              )}
              {userRole === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={closeAllDropdowns}
                >
                  Dashboard Admin
                </Link>
              )}
              <button
                onClick={handleLogoutClick}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={toggleUserMenu}
            className="flex items-center text-gray-700 hover:text-blue-600 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <DropdownArrow isOpen={isUserMenuOpen} />
          </button>
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
              <Link
                to="/login"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={closeAllDropdowns}
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={closeAllDropdowns}
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      );
    }
  };

  // Renderiza los menús específicos para el rol de emprendedor (desktop)
  const renderEntrepreneurDesktopMenus = () => {
    if (isAuthenticated && userRole === 'entrepreneur' && user?.managedClubId) {
      return (
        <>
          {/* Menú: Gestión del Club */}
          <div className="relative" ref={clubManagementMenuRef}>
            <button
              onClick={toggleClubManagementMenu}
              className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Gestión del Club
              <DropdownArrow isOpen={isClubManagementMenuOpen} />
            </button>
            {isClubManagementMenuOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-20">
                <Link
                  to={`/club/${user.managedClubId}`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={closeAllDropdowns}
                >
                  Editar Perfil del Club
                </Link>
                <Link
                  to={`/club/${user.managedClubId}/history`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={closeAllDropdowns}
                >
                  Editar Historia del Club
                </Link>
                <Link
                  to={`/entrepreneur/club/${user.managedClubId}/edit-subscriptions`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={closeAllDropdowns}
                >
                  Gestionar Suscripciones
                </Link>
                <Link
                  to={`/entrepreneur/inventory-management`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={closeAllDropdowns}
                >
                  Gestionar Inventario
                </Link>
                <Link
                  to={`/entrepreneur/club/${user.managedClubId}/edit-terms`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={closeAllDropdowns}
                >
                  Términos y Condiciones
                </Link>
                <Link
                  to={`/entrepreneur/club/${user.managedClubId}/edit-policies`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={closeAllDropdowns}
                >
                  Políticas y Seguridad
                </Link>
              </div>
            )}
          </div>

          {/* Menú: Operaciones (Clientes y Logística) - Dos Columnas */}
          <div className="relative" ref={operationsMenuRef}>
            <button
              onClick={toggleOperationsMenu}
              className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Operaciones
              <DropdownArrow isOpen={isOperationsMenuOpen} />
            </button>
            {isOperationsMenuOpen && (
              <div className="absolute left-0 mt-2 w-96 bg-white rounded-md shadow-lg py-1 z-20 grid grid-cols-2 gap-4 p-4">
                <div>
                  <p className="block px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Clientes</p>
                  <Link
                    to={`/entrepreneur/club/${user.managedClubId}/active-subscriptions`}
                    className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeAllDropdowns}
                  >
                    Ver Suscripciones Activas
                  </Link>
                  <Link
                    to={`/entrepreneur/club/${user.managedClubId}/customer-history`}
                    className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeAllDropdowns}
                  >
                    Historial de Clientes
                  </Link>
                  <Link
                    to={`/entrepreneur/club/${user.managedClubId}/manage-customers`}
                    className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeAllDropdowns}
                  >
                    Gestionar Clientes
                  </Link>
                </div>
                <div>
                  <p className="block px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Logística</p>
                  <Link
                    to={`/entrepreneur/club/${user.managedClubId}/assign-deliveries`}
                    className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeAllDropdowns}
                  >
                    Asignar Envíos
                  </Link>
                  <Link
                    to={`/entrepreneur/club/${user.managedClubId}/view-deliveries`}
                    className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeAllDropdowns}
                  >
                    Ver Envíos del Día
                  </Link>
                  <Link
                    to={`/entrepreneur/club/${user.managedClubId}/delivery-history`}
                    className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeAllDropdowns}
                  >
                    Historial de Entregas
                  </Link>
                  <Link
                    to={`/entrepreneur/club/${user.managedClubId}/manage-riders`}
                    className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeAllDropdowns}
                  >
                    Gestionar Riders
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Menú: Marketing y Comunicación (Marketing y Comunidad) - Dos Columnas */}
          <div className="relative" ref={marketingCommMenuRef}>
            <button
              onClick={toggleMarketingCommMenu}
              className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Marketing y Comunicación
              <DropdownArrow isOpen={isMarketingCommMenuOpen} />
            </button>
            {isMarketingCommMenuOpen && (
              <div className="absolute left-0 mt-2 w-96 bg-white rounded-md shadow-lg py-1 z-20 grid grid-cols-2 gap-4 p-4">
                <div>
                  <p className="block px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Marketing</p>
                  <Link
                    to={`/entrepreneur/club/${user.managedClubId}/gestionar-imagenes`}
                    className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeAllDropdowns}
                  >
                    Gestionar Imágenes del Club
                  </Link>
                  <Link
                    to={`/entrepreneur/club/${user.managedClubId}/administrar-promociones`}
                    className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeAllDropdowns}
                  >
                    Administrar Promociones
                  </Link>
                  <Link
                    to={`/entrepreneur/club/${user.managedClubId}/enviar-newsletters`}
                    className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeAllDropdowns}
                  >
                    Enviar Newsletters
                  </Link>
                </div>
                <div>
                  <p className="block px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Comunidad</p>
                  <Link
                    to={`/entrepreneur/club/${user.managedClubId}/moderate-reviews`}
                    className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeAllDropdowns}
                  >
                    Moderar Reseñas
                  </Link>
                  <Link
                    to={''} // Gestionar Eventos (se mantiene vacío por ahora)
                    className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeAllDropdowns}
                  >
                    Gestionar Eventos
                  </Link>
                  <Link
                    to={`/entrepreneur/club/${user.managedClubId}/customer-support`}
                    className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeAllDropdowns}
                  >
                    Atención Post-Venta
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Menú: Herramientas de Administración (Análisis, Finanzas, Equipo) - Dos Columnas */}
          <div className="relative" ref={adminToolsMenuRef}>
            <button
              onClick={toggleAdminToolsMenu}
              className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Herramientas de Administración
              <DropdownArrow isOpen={isAdminToolsMenuOpen} />
            </button>
            {isAdminToolsMenuOpen && (
              <div className="absolute left-0 mt-2 w-96 bg-white rounded-md shadow-lg py-1 z-20 grid grid-cols-2 gap-4 p-4">
                <div>
                  <p className="block px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Análisis y Reportes</p>
                  <Link
                    to={`/entrepreneur/club/${user.managedClubId}/stats`}
                    className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeAllDropdowns}
                  >
                    Ver Estadísticas del Club
                  </Link>
                  <Link
                    to={`/entrepreneur/club/${user.managedClubId}/sales-reports`}
                    className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeAllDropdowns}
                  >
                    Reportes de Ventas
                  </Link>
                  <Link
                    to={`/entrepreneur/club/${user.managedClubId}/feedback-trends`}
                    className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeAllDropdowns}
                  >
                    Feedback y Tendencias
                  </Link>
                </div>
                <div>
                  <p className="block px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Finanzas y Equipo</p>
                  <Link
                    to={`/entrepreneur/club/${user.managedClubId}/financial-management`}
                    className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeAllDropdowns}
                  >
                    Gestión Financiera (Movimientos y Facturación)
                  </Link>
                  <Link
                    to={`/entrepreneur/club/${user.managedClubId}/manage-users-roles`}
                    className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeAllDropdowns}
                  >
                    Gestionar Usuarios y Roles
                  </Link>
                  <Link
                    to={`/entrepreneur/club/${user.managedClubId}/general-settings`}
                    className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={closeAllDropdowns}
                  >
                    Ajustes Generales
                  </Link>
                </div>
              </div>
            )}
          </div>
        </>
      );
    }
    return null;
  };

  // Renderiza los menús específicos para el rol de emprendedor (mobile)
  const renderEntrepreneurMobileMenus = () => {
    if (isAuthenticated && userRole === 'entrepreneur' && user?.managedClubId) {
      return (
        <>
          {/* Gestión del Club (Mobile) */}
          <button
            onClick={() => toggleMobileSubMenu('clubManagement')}
            className="flex items-center justify-between w-full text-gray-700 hover:bg-gray-50 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
          >
            Gestión del Club
            <DropdownArrow isOpen={isMobileSubMenuOpen === 'clubManagement'} />
          </button>
          {isMobileSubMenuOpen === 'clubManagement' && (
            <div className="pl-6 pr-3 py-1 space-y-1">
              <Link to={`/club/${user.managedClubId}`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Editar Perfil del Club
              </Link>
              <Link to={`/club/${user.managedClubId}/history`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Editar Historia del Club
              </Link>
              <Link to={`/entrepreneur/club/${user.managedClubId}/edit-subscriptions`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Gestionar Suscripciones
              </Link>
              <Link to={`/entrepreneur/inventory-management`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Gestionar Inventario
              </Link>
              <Link to={`/entrepreneur/club/${user.managedClubId}/edit-terms`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Términos y Condiciones
              </Link>
              <Link to={`/entrepreneur/club/${user.managedClubId}/edit-policies`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Políticas y Seguridad
              </Link>
            </div>
          )}
          {/* Operaciones (Mobile) */}
          <button
            onClick={() => toggleMobileSubMenu('operations')}
            className="flex items-center justify-between w-full text-gray-700 hover:bg-gray-50 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
          >
            Operaciones
            <DropdownArrow isOpen={isMobileSubMenuOpen === 'operations'} />
          </button>
          {isMobileSubMenuOpen === 'operations' && (
            <div className="pl-6 pr-3 py-1 space-y-1">
              <p className="block text-xs font-semibold text-gray-500 uppercase py-1">Clientes</p>
              <Link to={`/entrepreneur/club/${user.managedClubId}/active-subscriptions`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Ver Suscripciones Activas
              </Link>
              <Link to={`/entrepreneur/club/${user.managedClubId}/customer-history`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Historial de Clientes
              </Link>
              <Link to={`/entrepreneur/club/${user.managedClubId}/manage-customers`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Gestionar Clientes
              </Link>
              <p className="block text-xs font-semibold text-gray-500 uppercase py-1 mt-2">Logística</p>
              <Link to={`/entrepreneur/club/${user.managedClubId}/assign-deliveries`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Asignar Envíos
              </Link>
              <Link to={`/entrepreneur/club/${user.managedClubId}/view-deliveries`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Ver Envíos del Día
              </Link>
              <Link to={`/entrepreneur/club/${user.managedClubId}/delivery-history`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Historial de Entregas
              </Link>
              <Link to={`/entrepreneur/club/${user.managedClubId}/manage-riders`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Gestionar Riders
              </Link>
            </div>
          )}

          {/* Marketing y Comunicación (Mobile) */}
          <button
            onClick={() => toggleMobileSubMenu('marketingComm')}
            className="flex items-center justify-between w-full text-gray-700 hover:bg-gray-50 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
          >
            Marketing y Comunicación
            <DropdownArrow isOpen={isMobileSubMenuOpen === 'marketingComm'} />
          </button>
          {isMobileSubMenuOpen === 'marketingComm' && (
            <div className="pl-6 pr-3 py-1 space-y-1">
              <p className="block text-xs font-semibold text-gray-500 uppercase py-1">Marketing</p>
              <Link to={`/entrepreneur/club/${user.managedClubId}/gestionar-imagenes`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Gestionar Imágenes del Club
              </Link>
              <Link to={`/entrepreneur/club/${user.managedClubId}/administrar-promociones`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Administrar Promociones
              </Link>
              <Link to={`/entrepreneur/club/${user.managedClubId}/enviar-newsletters`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Enviar Newsletters
              </Link>
              <p className="block text-xs font-semibold text-gray-500 uppercase py-1 mt-2">Comunidad</p>
              <Link to={`/entrepreneur/club/${user.managedClubId}/moderate-reviews`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Moderar Reseñas
              </Link>
              <Link to={''} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Gestionar Eventos
              </Link>
              <Link to={`/entrepreneur/club/${user.managedClubId}/customer-support`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Atención Post-Venta
              </Link>
            </div>
          )}

          {/* Herramientas de Administración (Mobile) */}
          <button
            onClick={() => toggleMobileSubMenu('adminTools')}
            className="flex items-center justify-between w-full text-gray-700 hover:bg-gray-50 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
          >
            Herramientas de Administración
            <DropdownArrow isOpen={isMobileSubMenuOpen === 'adminTools'} />
          </button>
          {isMobileSubMenuOpen === 'adminTools' && (
            <div className="pl-6 pr-3 py-1 space-y-1">
              <p className="block text-xs font-semibold text-gray-500 uppercase py-1">Análisis y Reportes</p>
              <Link to={`/entrepreneur/club/${user.managedClubId}/stats`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Ver Estadísticas del Club
              </Link>
              <Link to={`/entrepreneur/club/${user.managedClubId}/sales-reports`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Reportes de Ventas
              </Link>
              <Link to={`/entrepreneur/club/${user.managedClubId}/feedback-trends`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Feedback y Tendencias
              </Link>
              <p className="block text-xs font-semibold text-gray-500 uppercase py-1 mt-2">Finanzas y Equipo</p>
              <Link to={`/entrepreneur/club/${user.managedClubId}/financial-management`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Gestión Financiera (Movimientos y Facturación)
              </Link>
              <Link to={`/entrepreneur/club/${user.managedClubId}/manage-users-roles`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Gestionar Usuarios y Roles
              </Link>
              <Link to={`/entrepreneur/club/${user.managedClubId}/general-settings`} className="block text-sm text-gray-700 hover:bg-gray-100 py-1" onClick={closeAllDropdowns}>
                Ajustes Generales
              </Link>
            </div>
          )}
        </>
      );
    }
    return null;
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      {/* Modificado: max-w-full para que ocupe todo el ancho y controlamos el padding interno */}
      <div className="max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Añadimos un padding a la izquierda del logo para que no toque el borde */}
            <Link to="/" className="flex-shrink-0 pl-2"> {/* Ajusta 'pl-2' según necesites */}
              <img className="h-8 w-auto" src="/aurabox-logo.png" alt="AuraBox Logo" />
            </Link>
            <div className="hidden md:ml-6 md:space-x-8 md:flex">
              {/* "Explorar Clubes" solo si no es emprendedor */}
              {userRole !== 'entrepreneur' && (
                <Link
                  to="/explore"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  onClick={closeAllDropdowns}
                >
                  Explorar Clubes
                </Link>
              )}

              {/* Menú "Ayuda" (Desktop) */}
              <div className="relative" ref={helpMenuRef}>
                <button
                  onClick={toggleHelpMenu}
                  className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Ayuda
                  <DropdownArrow isOpen={isHelpMenuOpen} />
                </button>
                {isHelpMenuOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                    <Link
                      to={isAuthenticated && userRole === 'entrepreneur' ? "/how-it-works/entrepreneurs" : "/how-it-works/subscribers"}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={closeAllDropdowns}
                    >
                      Cómo Funciona
                    </Link>
                    <Link
                      to="/faq"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={closeAllDropdowns}
                    >
                      FAQ
                    </Link>
                    <Link
                      to="/contact"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={closeAllDropdowns}
                    >
                      Contacto
                    </Link>
                  </div>
                )}
              </div>

              {/* "Sobre Nosotros" solo si NO es emprendedor */}
              {userRole !== 'entrepreneur' && (
                <Link
                  to="/about-us"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  onClick={closeAllDropdowns}
                >
                  Sobre Nosotros
                </Link>
              )}

              {/* Opciones adicionales para Cliente Logueado */}
              {isAuthenticated && userRole === 'customer' && (
                <>
                  {/* Icono Wishlist (Corazón) */}
                  <Link
                    to="/customer/wishlist"
                    className="text-gray-700 hover:text-red-500 p-2 rounded-md transition-colors duration-200"
                    onClick={closeAllDropdowns}
                    title="Mi Lista de Deseos"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      ></path>
                    </svg>
                  </Link>

                  {/* Icono Carrito */}
                  <Link
                    to="/cart"
                    className="text-gray-700 hover:text-blue-600 p-2 rounded-md transition-colors duration-200 ml-2"
                    onClick={closeAllDropdowns}
                    title="Mi Carrito"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 7.5M7 13l-1.5 7.5M17 13l1.5 7.5M17 13l4-8m-8 4h8M9 4h6m-6 0h6a2 2 0 002-2V2a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z"
                      ></path>
                    </svg>
                  </Link>
                </>
              )}

              {renderEntrepreneurDesktopMenus()} {/* Menús para emprendedores (desktop) */}
            </div>
          </div>
          <div className="flex items-center md:ml-6 pr-2"> {/* Ajustado padding */}
            {renderAuthButtons()}
            <div className="-mr-2 flex md:hidden">
              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg py-2 z-40 overflow-y-auto max-h-[calc(100vh-64px)]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {userRole !== 'entrepreneur' && (
              <Link
                to="/explore"
                className="text-gray-700 hover:bg-gray-50 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeAllDropdowns}
              >
                Explorar Clubes
              </Link>
            )}

            {/* Menú "Ayuda" (Mobile) */}
            <button
              onClick={() => toggleMobileSubMenu('help')}
              className="flex items-center justify-between w-full text-gray-700 hover:bg-gray-50 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
            >
              Ayuda
              <DropdownArrow isOpen={isMobileSubMenuOpen === 'help'} />
            </button>
            {isMobileSubMenuOpen === 'help' && (
              <div className="pl-6 pr-3 py-1 space-y-1">
                <Link
                  to={isAuthenticated && userRole === 'entrepreneur' ? "/how-it-works/entrepreneurs" : "/how-it-works/subscribers"}
                  className="block text-sm text-gray-700 hover:bg-gray-100 py-1"
                  onClick={closeAllDropdowns}
                >
                  Cómo Funciona
                </Link>
                <Link
                  to="/faq"
                  className="block text-sm text-gray-700 hover:bg-gray-100 py-1"
                  onClick={closeAllDropdowns}
                >
                  FAQ
                </Link>
                <Link
                  to="/contact"
                  className="block text-sm text-gray-700 hover:bg-gray-100 py-1"
                  onClick={closeAllDropdowns}
                >
                  Contacto
                </Link>
              </div>
            )}

            {/* "Sobre Nosotros" solo si NO es emprendedor (Mobile) */}
            {userRole !== 'entrepreneur' && (
              <Link
                to="/about-us"
                className="text-gray-700 hover:bg-gray-50 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeAllDropdowns}
              >
                Sobre Nosotros
              </Link>
            )}

            {isAuthenticated ? (
              <>
                {userRole === 'customer' && (
                  <>
                    <Link
                      to="/customer/profile"
                      className="text-gray-700 hover:bg-gray-50 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={closeAllDropdowns}
                    >
                      Mi Perfil
                    </Link>
                    <Link
                      to="/customer/reviews"
                      className="text-gray-700 hover:bg-gray-50 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                      onClick={closeAllDropdowns}
                    >
                      Mis Reseñas
                    </Link>
                    {/* Iconos de Wishlist y Carrito (ya agregados previamente) */}
                    <Link
                      to="/customer/wishlist"
                      className="text-gray-700 hover:bg-gray-50 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium flex flex-col items-center"
                      onClick={closeAllDropdowns}
                    >
                      <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                      <span className="text-sm">Wishlist</span>
                    </Link>
                    <Link
                      to="/cart"
                      className="text-gray-700 hover:bg-gray-50 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium flex flex-col items-center"
                      onClick={closeAllDropdowns}
                    >
                      <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 7.5M7 13l-1.5 7.5M17 13l1.5 7.5M17 13l4-8m-8 4h8M9 4h6m-6 0h6a2 2 0 002-2V2a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z"></path>
                      </svg>
                      <span className="text-sm">Carrito</span>
                    </Link>
                  </>
                )}
                {userRole === 'entrepreneur' && renderEntrepreneurMobileMenus()} {/* Menús para emprendedores (mobile) */}
                {userRole === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className="text-gray-700 hover:bg-gray-50 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={closeAllDropdowns}
                  >
                    Dashboard Admin
                  </Link>
                )}
                <button
                  onClick={handleLogoutClick}
                  className="block w-full text-left text-red-600 hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:bg-gray-50 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={closeAllDropdowns}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="text-gray-700 hover:bg-gray-50 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={closeAllDropdowns}
                >
                  Registrarse
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
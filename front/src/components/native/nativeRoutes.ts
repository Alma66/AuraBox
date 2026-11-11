export type TabKey = 'home' | 'explore' | 'cart' | 'orders' | 'account';

export const ROOT_PATHS = ['/', '/explore', '/cart', '/customer/orders', '/customer/profile'];

const TAB_HIDDEN_PREFIXES = ['/checkout', '/login', '/register', '/logout', '/work-with-us', '/newsletter'];

export const isRootPath = (pathname: string): boolean => ROOT_PATHS.includes(pathname);

export const hidesTabBar = (pathname: string): boolean =>
  TAB_HIDDEN_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ||
  /^\/club\/[^/]+\/plan\//.test(pathname);

export const tabForPath = (pathname: string): TabKey | null => {
  if (pathname === '/') return 'home';
  if (pathname === '/explore' || pathname.startsWith('/club/')) return 'explore';
  if (pathname === '/cart' || pathname === '/checkout') return 'cart';
  if (pathname === '/customer/orders' || pathname === '/customer/subscriptions') return 'orders';
  if (
    pathname === '/customer/profile' ||
    pathname.startsWith('/customer/account/') ||
    pathname === '/customer/wishlist' ||
    pathname === '/customer/notifications' ||
    pathname === '/customer/reviews' ||
    pathname === '/login' ||
    pathname.startsWith('/register')
  ) {
    return 'account';
  }
  return null;
};

const STATIC_TITLES: Record<string, string> = {
  '/': 'AuraBox',
  '/explore': 'Explorar',
  '/cart': 'Mi carrito',
  '/checkout': 'Finalizar compra',
  '/customer/orders': 'Mis pedidos',
  '/customer/subscriptions': 'Mis suscripciones',
  '/customer/profile': 'Mi cuenta',
  '/customer/reviews': 'Mis reseñas',
  '/customer/wishlist': 'Mis favoritos',
  '/customer/notifications': 'Notificaciones',
  '/faq': 'Preguntas frecuentes',
  '/contact': 'Contacto',
  '/about-us': 'Sobre AuraBox',
  '/platform-rules': 'Reglas de la plataforma',
  '/login': 'Ingresar',
  '/register': 'Crear cuenta',
  '/register/entrepreneur': 'Crear cuenta',
  '/register/complete-profile': 'Completar perfil',
  '/work-with-us': 'Trabajá con nosotros',
};

const ACCOUNT_SECTION_TITLES: Record<string, string> = {
  profile: 'Mis datos',
  location: 'Ubicación',
  security: 'Seguridad y privacidad',
  settings: 'Configuración',
};

export const getHeaderTitle = (pathname: string): string => {
  if (STATIC_TITLES[pathname]) return STATIC_TITLES[pathname];
  const accountSection = /^\/customer\/account\/([^/]+)$/.exec(pathname);
  if (accountSection) return ACCOUNT_SECTION_TITLES[accountSection[1]] ?? 'Mi cuenta';
  if (/^\/club\/[^/]+\/plan\//.test(pathname)) return 'Detalle del plan';
  if (/^\/club\/[^/]+\/reviews/.test(pathname)) return 'Reseñas';
  if (/^\/club\/[^/]+\/history/.test(pathname)) return 'Nuestra historia';
  if (/^\/club\/[^/]+\/(terms-and-conditions|privacy-and-security)/.test(pathname)) return 'Información legal';
  if (pathname.startsWith('/club/')) return 'Emprendimiento';
  return 'AuraBox';
};
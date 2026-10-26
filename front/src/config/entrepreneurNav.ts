import type { IconName } from '../components/entrepreneur/layout/Icon';

export interface NavTab {
  id: string;
  label: string;
  to: (clubId: string) => string;
  alsoMatches?: (clubId: string) => string[];
}

export interface NavSection {
  id: string;
  label: string;
  icon: IconName;
  mobilePrimary?: boolean;
  tabs: NavTab[];
}

export interface ActiveNav {
  section: NavSection | null;
  tab: NavTab | null;
}

const club = (clubId: string) => `/entrepreneur/club/${clubId}`;

export const ENTREPRENEUR_SECTIONS: NavSection[] = [
  {
    id: 'dashboard',
    label: 'Resumen',
    icon: 'dashboard',
    mobilePrimary: true,
    tabs: [{ id: 'overview', label: 'Resumen', to: () => '/entrepreneur/dashboard' }],
  },
    {
    id: 'my-club',
    label: 'Mi club',
    icon: 'club',
    tabs: [
      {
        id: 'my-club',
        label: 'Mi club',
        to: (c) => `${club(c)}/my-club`,
        alsoMatches: (c) => [`/club/${c}`],
      },
    ],
  },
  {
    id: 'plans',
    label: 'Planes y cajas',
    icon: 'plans',
    tabs: [{ id: 'plans', label: 'Planes y cajas', to: (c) => `${club(c)}/plans` }],
  },
    {
    id: 'customers',
    label: 'Clientes',
    icon: 'users',
    mobilePrimary: true,
    tabs: [
      {
        id: 'customers',
        label: 'Clientes',
        to: (c) => `${club(c)}/customers`,
        alsoMatches: (c) => [`${club(c)}/subscription`],
      },
    ],
  },
    {
    id: 'shipments',
    label: 'Envíos',
    icon: 'truck',
    mobilePrimary: true,
    tabs: [{ id: 'shipments', label: 'Envíos', to: (c) => `${club(c)}/shipments` }],
  },
  {
    id: 'inventory',
    label: 'Inventario',
    icon: 'inventory',
    tabs: [
      { id: 'stock', label: 'Stock e insumos', to: (c) => `${club(c)}/inventory/stock` },
      { id: 'suppliers', label: 'Proveedores', to: (c) => `${club(c)}/inventory/proveedores` },
      { id: 'orders', label: 'Pedidos', to: (c) => `${club(c)}/inventory/pedidos` },
      { id: 'categories', label: 'Categorías', to: (c) => `${club(c)}/inventory/categorias` },
    ],
  },
  {
    id: 'finance',
    label: 'Finanzas',
    icon: 'finance',
    tabs: [
      { id: 'movements', label: 'Caja y movimientos', to: (c) => `${club(c)}/finance/movimientos` },
      { id: 'profitability', label: 'Costos y rentabilidad', to: (c) => `${club(c)}/finance/rentabilidad` },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: 'marketing',
    tabs: [
      { id: 'promotions', label: 'Promociones', to: (c) => `${club(c)}/administrar-promociones` },
      { id: 'newsletters', label: 'Newsletters', to: (c) => `${club(c)}/enviar-newsletters` },
    ],
  },
  {
    id: 'community',
    label: 'Comunidad',
    icon: 'community',
    mobilePrimary: true,
    tabs: [
      { id: 'support', label: 'Atención post-venta', to: (c) => `${club(c)}/customer-support` },
      { id: 'reviews', label: 'Reseñas', to: (c) => `${club(c)}/moderate-reviews` },
    ],
  },
  {
    id: 'analytics',
    label: 'Analítica',
    icon: 'analytics',
    tabs: [
      { id: 'stats', label: 'Estadísticas', to: (c) => `${club(c)}/stats` },
      { id: 'sales', label: 'Reportes de ventas', to: (c) => `${club(c)}/sales-reports` },
      { id: 'feedback', label: 'Feedback y tendencias', to: (c) => `${club(c)}/feedback-trends` },
    ],
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: 'settings',
    tabs: [
      { id: 'general', label: 'Ajustes generales', to: (c) => `${club(c)}/general-settings` },
      { id: 'terms', label: 'Términos y condiciones', to: (c) => `${club(c)}/edit-legal-info/terms` },
      { id: 'privacy', label: 'Política de seguridad', to: (c) => `${club(c)}/edit-legal-info/privacy` },
      { id: 'compliance', label: 'Cumplimiento legal', to: (c) => `${club(c)}/legal-compliance` },
    ],
  },
];

export const sectionHref = (section: NavSection, clubId: string) => section.tabs[0].to(clubId);

const matchesPath = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(`${base}/`);

export const resolveActiveNav = (pathname: string, clubId: string): ActiveNav => {
  let best: ActiveNav = { section: null, tab: null };
  let bestLength = -1;

  ENTREPRENEUR_SECTIONS.forEach((section) => {
    section.tabs.forEach((tab) => {
      const candidates = [tab.to(clubId), ...(tab.alsoMatches ? tab.alsoMatches(clubId) : [])];
      candidates.forEach((candidate) => {
        if (matchesPath(pathname, candidate) && candidate.length > bestLength) {
          best = { section, tab };
          bestLength = candidate.length;
        }
      });
    });
  });

  return best;
};
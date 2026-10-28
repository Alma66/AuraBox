import type { IconName } from '../components/entrepreneur/layout/Icon';

export interface AdminSection {
  id: string;
  label: string;
  icon: IconName;
  to: string;
}

export const ADMIN_SECTIONS: AdminSection[] = [
  { id: 'dashboard', label: 'Resumen', icon: 'dashboard', to: '/admin/dashboard' },
  { id: 'clubs', label: 'Clubes', icon: 'club', to: '/admin/clubs' },
];

export const resolveAdminSection = (pathname: string) =>
  ADMIN_SECTIONS.find((section) => pathname === section.to || pathname.startsWith(`${section.to}/`)) ?? null;
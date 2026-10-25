import React from 'react';

export type IconName =
  | 'dashboard'
  | 'club'
  | 'plans'
  | 'users'
  | 'truck'
  | 'inventory'
  | 'finance'
  | 'marketing'
  | 'community'
  | 'analytics'
  | 'settings'
  | 'help'
  | 'logout'
  | 'menu'
  | 'close'
  | 'chevronDown'
  | 'chevronLeft'
  | 'chevronRight'
  | 'search'
  | 'user'
  | 'more'
  | 'arrow';

const ICONS: Record<IconName, React.ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  club: (
    <>
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M4 9v11h16V9" />
      <path d="M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  plans: (
    <>
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0113 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M17 14.5a5 5 0 014.5 5" />
    </>
  ),
  truck: (
    <>
      <rect x="2" y="6" width="11" height="10" rx="1" />
      <path d="M13 9h4l4 4v3h-8z" />
      <circle cx="6.5" cy="17.5" r="2" />
      <circle cx="17.5" cy="17.5" r="2" />
    </>
  ),
  inventory: (
    <>
      <rect x="3" y="4" width="18" height="5" rx="1" />
      <path d="M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9" />
      <path d="M10 13h4" />
    </>
  ),
  finance: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </>
  ),
  marketing: (
    <>
      <path d="M3 11v2a1 1 0 001 1h3l8 4V6L7 10H4a1 1 0 00-1 1z" />
      <path d="M18.5 9a4 4 0 010 6" />
    </>
  ),
  community: <path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.4A8 8 0 1121 12z" />,
  analytics: (
    <>
      <path d="M4 20h16" />
      <path d="M7 20v-7M12 20V5M17 20v-10" />
    </>
  ),
  settings: (
    <>
      <path d="M4 6h9M19 6h1" />
      <circle cx="16" cy="6" r="2" />
      <path d="M4 12h3M13 12h7" />
      <circle cx="10" cy="12" r="2" />
      <path d="M4 18h12M20 18h.01" />
      <circle cx="18" cy="18" r="2" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 114 2c-.8.6-1.5 1-1.5 2" />
      <path d="M12 17h.01" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  chevronLeft: <path d="M15 6l-6 6 6 6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0116 0" />
    </>
  ),
  more: <path strokeWidth={3} d="M5 12h.01M12 12h.01M19 12h.01" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
};

interface IconProps {
  name: IconName;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className = 'w-5 h-5' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {ICONS[name]}
  </svg>
);

export default Icon;
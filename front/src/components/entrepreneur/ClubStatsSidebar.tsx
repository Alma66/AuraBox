import React from 'react';

type StatsSection = 'resumen' | 'evolucion' | 'logistica' | 'reputacion' | 'planes';

interface ClubStatsSidebarProps {
  activeSection: StatsSection;
  setActiveSection: (s: StatsSection) => void;
}

const ClubStatsSidebar: React.FC<ClubStatsSidebarProps> = ({ activeSection, setActiveSection }) => {
  const items: { id: StatsSection; label: string; icon: string }[] = [
    {
      id: 'resumen',
      label: 'Resumen General',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    },
    {
      id: 'evolucion',
      label: 'Evolución de Suscriptores',
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    },
    {
      id: 'logistica',
      label: 'Logística y Envíos',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    },
    {
      id: 'reputacion',
      label: 'Reputación',
      icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    },
    {
      id: 'planes',
      label: 'Planes y Suscripciones',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    },
  ];

  return (
    <nav className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors
                ${activeSection === item.id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}
            >
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ClubStatsSidebar;
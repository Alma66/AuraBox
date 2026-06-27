import React from 'react';

type SalesSection = 'resumen' | 'graficos' | 'pagos' | 'metodos' | 'proyecciones';

interface SalesReportsSidebarProps {
  activeSection: SalesSection;
  setActiveSection: (s: SalesSection) => void;
}

const SalesReportsSidebar: React.FC<SalesReportsSidebarProps> = ({ activeSection, setActiveSection }) => {
  const items: { id: SalesSection; label: string; icon: string }[] = [
    {
      id: 'resumen',
      label: 'Resumen',
      icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    },
    {
      id: 'graficos',
      label: 'Gráficos',
      icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z',
    },
    {
      id: 'pagos',
      label: 'Detalle de Pagos',
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    },
    {
      id: 'metodos',
      label: 'Métodos de Pago',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    },
    {
      id: 'proyecciones',
      label: 'Proyecciones',
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
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

export default SalesReportsSidebar;
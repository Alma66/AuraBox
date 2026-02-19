import React from 'react';
import { Link } from 'react-router-dom';

type AdminToolSection = 'stats' | 'sales' | 'feedback';

interface AdminToolsSidebarProps {
  activeSection: AdminToolSection;
  setActiveSection: (section: AdminToolSection) => void;
  clubId: string;
}

const AdminToolsSidebar: React.FC<AdminToolsSidebarProps> = ({ activeSection, setActiveSection, clubId }) => {
  const menuItems = [
    {
      id: 'stats' as AdminToolSection,
      label: 'Estadísticas del Club',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      path: `/entrepreneur/club/${clubId}/stats`,
    },
    {
      id: 'sales' as AdminToolSection,
      label: 'Reportes de Ventas',
      icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
      path: `/entrepreneur/club/${clubId}/sales-reports`,
    },
    {
      id: 'feedback' as AdminToolSection,
      label: 'Feedback y Tendencias',
      icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0 2 2 0 010-2.828L7.586 9 7 8.414V7zM3 3h2v4H3V3zm0 8h2v4H3v-4zm8 8h2v-4h-2v4zm0-12h2V3h-2v4zm8 12h2v-4h-2v4zm0-8h2V3h-2v4z',
      path: `/entrepreneur/club/${clubId}/feedback-trends`,
    },
  ];

  return (
    <nav className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Análisis y Reportes</h3>
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.id}>
            <Link
              to={item.path}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center p-3 rounded-lg text-left font-medium transition-colors duration-200 
                ${activeSection === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'}`}
            >
              <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
              </svg>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default AdminToolsSidebar;
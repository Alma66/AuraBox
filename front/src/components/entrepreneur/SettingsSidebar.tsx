import React from 'react';

interface SettingsSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ activeSection, setActiveSection }) => {
  const sidebarItems = [
    { id: 'finances', label: 'Finanzas', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7m-9 6v-5.375A4.374 4.374 0 0015 3H9a3.375 3.375 0 00-3.375 3.375V13' },
    { id: 'team', label: 'Equipo', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
    { id: 'notifications', label: 'Notificaciones', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  ];

  return (
    <nav className="bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-6 w-full lg:w-64">
      <h3 className="text-lg font-serif font-bold text-aurora-navy mb-4">Ajustes Generales</h3>
      <ul className="space-y-2">
        {sidebarItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center p-3 rounded-lg text-left font-medium transition-colors duration-200
                ${activeSection === item.id ? 'bg-aurora-navy text-white shadow-sm' : 'text-aurora-navy/80 hover:bg-aurora-cream hover:text-aurora-navy'}`}
            >
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SettingsSidebar;
import React from 'react';

interface CustomerSupportSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  openCount: number;
}

const CustomerSupportSidebar: React.FC<CustomerSupportSidebarProps> = ({ activeSection, setActiveSection, openCount }) => {
  const menuItems = [
    { id: 'abiertas', label: `Conversaciones Abiertas${openCount > 0 ? ` (${openCount})` : ''}`, icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
    { id: 'cerradas', label: 'Cerradas / Historial', icon: 'M5 13l4 4L19 7' },
    { id: 'automaticos', label: 'Mensajes Automáticos', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  ];

  return (
    <nav className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <ul className="space-y-1">
        {menuItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors
                ${activeSection === item.id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
              </svg>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default CustomerSupportSidebar;
import React from 'react';

interface ManagePromotionsSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const ManagePromotionsSidebar: React.FC<ManagePromotionsSidebarProps> = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'promociones', label: 'Promociones Activas', icon: 'M19 14l-7 7m0 0l-7-7m7 7V3' },
    { id: 'historial', label: 'Historial de Promociones', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'especiales', label: 'Promociones Especiales', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  return (
    <nav className="bg-white rounded-xl shadow-lg p-6">
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center p-3 rounded-lg text-left font-medium transition-colors duration-200 
                ${activeSection === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'}`}
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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

export default ManagePromotionsSidebar;
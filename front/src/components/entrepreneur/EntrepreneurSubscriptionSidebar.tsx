import React from 'react';

interface EntrepreneurSubscriptionSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const EntrepreneurSubscriptionSidebar: React.FC<EntrepreneurSubscriptionSidebarProps> = ({ 
  activeSection, 
  setActiveSection 
}) => {
  const menuItems = [
    { 
      id: 'management', 
      label: 'Gestión de Suscripciones', 
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' 
    },
    { 
      id: 'create', 
      label: 'Crear Nuevo Plan', 
      icon: 'M12 4v16m8-8H4' 
    }
  ];

  return (
    <nav className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Gestión de Planes</h2>
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

export default EntrepreneurSubscriptionSidebar;
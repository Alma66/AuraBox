import React from 'react';

interface InventorySidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const InventorySidebar: React.FC<InventorySidebarProps> = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'product-inventory', label: 'Inventario de Productos', icon: 'M17 14v6m-3-3h6m-9-11h0l-7 19h14l-7-19z' },
    { id: 'packaging-inventory', label: 'Inventario de Packaging', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
    { id: 'master-data', label: 'Gestión de Maestros', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.827 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.827 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.827-2.37-2.37.996.608 2.296.07 2.572-1.065z' }
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

export default InventorySidebar;
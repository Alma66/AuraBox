import React from 'react';

interface ManagePromotionsSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const menuItems = [
  { id: 'activas', label: 'Promociones Activas', icon: 'M5 13l4 4L19 7' },
  { id: 'nueva', label: 'Crear Promoción', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
  { id: 'historial', label: 'Historial', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
];

const ManagePromotionsSidebar: React.FC<ManagePromotionsSidebarProps> = ({ activeSection, setActiveSection }) => {
  return (
    <nav className="bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-4">
      <ul className="space-y-1">
        {menuItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-left text-sm font-medium transition-colors
                ${activeSection === item.id ? 'bg-aurora-navy text-white shadow-aurora-sm' : 'text-aurora-navy/70 hover:bg-aurora-cream hover:text-aurora-navy'}`}
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

export default ManagePromotionsSidebar;
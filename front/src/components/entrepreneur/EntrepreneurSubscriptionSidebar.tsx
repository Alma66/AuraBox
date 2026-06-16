import React from 'react';

interface EntrepreneurSubscriptionSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const menuItems = [
  {
    id: 'management',
    label: 'Mis Planes',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  },
  {
    id: 'create',
    label: 'Crear Plan',
    icon: 'M12 4v16m8-8H4',
  },
];

const EntrepreneurSubscriptionSidebar: React.FC<EntrepreneurSubscriptionSidebarProps> = ({
  activeSection,
  setActiveSection,
}) => (
  <nav className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
    <h2 className="text-lg font-bold mb-6 text-gray-800 border-b pb-3">Planes de Suscripción</h2>
    <ul className="space-y-1">
      {menuItems.map((item) => (
        <li key={item.id}>
          <button
            onClick={() => setActiveSection(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-all duration-200
              ${activeSection === item.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'}`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
            </svg>
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  </nav>
);

export default EntrepreneurSubscriptionSidebar;
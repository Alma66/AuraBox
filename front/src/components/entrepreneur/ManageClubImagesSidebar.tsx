import React from 'react';

interface ManageClubImagesSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const ManageClubImagesSidebar: React.FC<ManageClubImagesSidebarProps> = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: 'Logo', label: 'Logo', icon: 'M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z' },
    { id: 'Banner', label: 'Banner', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'Historia', label: 'Historias', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'Equipo', label: 'Emprendedores', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
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

export default ManageClubImagesSidebar;
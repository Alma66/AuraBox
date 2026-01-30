import React from 'react';

interface UsersSidebarProps {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  roles: string[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const UsersSidebar: React.FC<UsersSidebarProps> = ({ 
  activeFilter, 
  setActiveFilter, 
  roles, 
  searchTerm, 
  setSearchTerm 
}) => {
  const sidebarItems = [
    { id: 'todos', label: 'Todos los Usuarios', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
    { id: 'activo', label: 'Usuarios Activos', icon: 'M5 13l4 4L19 7' },
    { id: 'inactivo', label: 'Usuarios Inactivos', icon: 'M6 18L18 6M6 6l12 12' },
    ...roles.map(role => ({ 
      id: role, 
      label: role.replace(/_/g, ' ').toUpperCase(), 
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' 
    })),
  ];

  return (
    <nav className="bg-white rounded-xl shadow-lg p-6 w-full lg:w-64">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Filtros de Equipo</h3>
      
      <ul className="space-y-2 mb-6">
        {sidebarItems.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => setActiveFilter(item.id)}
              className={`w-full flex items-center p-3 rounded-lg text-left font-medium transition-colors duration-200 
                ${activeFilter === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'}`}
            >
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">Buscar por Nombre/Email</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Escribe para buscar..."
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </nav>
  );
};

export default UsersSidebar;
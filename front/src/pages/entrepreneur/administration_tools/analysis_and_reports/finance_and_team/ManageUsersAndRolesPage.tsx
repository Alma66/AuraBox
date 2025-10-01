// FileName: /pages/entrepreneur/ManageUsersAndRolesPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../../../App';
import UsersSidebar from '../../../../../components/entrepreneur/UsersSidebar';
import usersRolesData from '../../../../../data/users-roles.json';
import { TeamUser } from '../../../../../types/financial';
import clubsData from '../../../../../data/clubs.json';

const ManageUsersAndRolesPage: React.FC = () => {
  const { user } = useAuth();
  const { clubId } = useParams<{ clubId: string }>();
  const actualClubId = clubId || user?.managedClubId || 'club-1';
  const club = (clubsData as any[]).find(c => c.id === actualClubId);
  const clubName = club?.name || 'Tu Club';

  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([]);
  const [activeFilter, setActiveFilter] = useState('todos'); // 'todos', 'activo', 'inactivo', o rol específico
  const [filteredUsers, setFilteredUsers] = useState<TeamUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar datos (simulado; en backend: fetch(`/api/clubs/${actualClubId}/team-users`))
  useEffect(() => {
    const data = (usersRolesData as any)[actualClubId] || (usersRolesData as any)['club-1'];
    setTeamUsers(data.users || []);
    setFilteredUsers(data.users || []);
  }, [actualClubId]);

  // Filtrar usuarios
  useEffect(() => {
    let filtered = [...teamUsers];

    // Por estado
    if (activeFilter === 'activo') {
      filtered = filtered.filter(u => u.status === 'activo');
    } else if (activeFilter === 'inactivo') {
      filtered = filtered.filter(u => u.status === 'inactivo');
    }

    // Por rol (si activeFilter es un rol específico)
    if (activeFilter !== 'todos' && activeFilter !== 'activo' && activeFilter !== 'inactivo') {
      filtered = filtered.filter(u => u.role === activeFilter);
    }

    // Por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [activeFilter, searchTerm, teamUsers]);

  // Roles dinámicos
  const roles = Array.from(new Set(teamUsers.map(u => u.role)));

  // Funciones simuladas (en backend: POST/PUT/DELETE /api/team-users)
  const handleAddUser = () => {
    console.log('Agregando nuevo usuario al equipo');
    // Aquí: modal o navegación a form de nuevo usuario
    alert('Funcionalidad de agregar usuario (simulada para backend)');
  };

  const handleEditUser = (teamUser: TeamUser) => {
    console.log('Editando usuario:', teamUser);
    // Aquí: modal para editar rol/estado/email
    alert(`Editando ${teamUser.name} (simulado)`);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('¿Confirmar eliminación?')) {
      console.log('Eliminando usuario:', userId);
      // En backend: DELETE /api/team-users/:id
      setTeamUsers(prev => prev.filter(u => u.id !== userId));
      alert('Usuario eliminado (simulado)');
    }
  };

  // Función renderUserRow
  const renderUserRow = (teamUser: TeamUser) => (
    <tr key={teamUser.id} className="border-b hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{teamUser.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teamUser.email}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            teamUser.role === 'administrador_del_club' ? 'bg-blue-100 text-blue-800' :
            teamUser.role === 'delivery_rider' ? 'bg-green-100 text-green-800' :
            teamUser.role.includes('moderador') ? 'bg-purple-100 text-purple-800' :
            'bg-gray-100 text-gray-800'
          }`}
        >
          {teamUser.role.replace(/_/g, ' ').toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          teamUser.status === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {teamUser.status.toUpperCase()}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(teamUser.assignedDate).toLocaleDateString('es-AR')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => handleEditUser(teamUser)}
          className="text-blue-600 hover:text-blue-900 mr-3"
        >
          Editar
        </button>
        <button
          onClick={() => handleDeleteUser(teamUser.id)}
          className="text-red-600 hover:text-red-900"
        >
          Eliminar
        </button>
      </td>
    </tr>
  );

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <UsersSidebar
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            roles={roles}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>

        {/* Contenido Principal */}
        <div className="lg:w-3/4 bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestionar Usuarios y Roles - {clubName}</h1>
          <p className="text-gray-600 mb-6">Total usuarios en equipo: {teamUsers.length}. Filtrados: {filteredUsers.length}.</p>

          <button
            onClick={handleAddUser}
            className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Agregar Nuevo Miembro al Equipo
          </button>

          {/* Tabla de Usuarios */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Asignado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(renderUserRow)
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No hay usuarios que coincidan con los filtros.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsersAndRolesPage;

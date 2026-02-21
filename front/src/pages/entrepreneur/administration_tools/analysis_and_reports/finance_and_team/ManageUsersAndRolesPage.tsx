import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../../App';
import UsersSidebar from '../../../../../components/entrepreneur/UsersSidebar';
import api, { getResponseData } from '../../../../../api/config';
import { TeamUser } from '../../../../../types/financial';

const ManageUsersAndRolesPage: React.FC = () => {
  const { user, userRole } = useAuth();
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const actualClubId = clubId || user?.managedClubId;
  const [clubName, setClubName] = useState('Tu Club');

  const [teamUsers, setTeamUsers] = useState<TeamUser[]>([]);
  const [activeFilter, setActiveFilter] = useState('todos');
  const [filteredUsers, setFilteredUsers] = useState<TeamUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (userRole !== 'entrepreneur' || !actualClubId) {
        navigate('/');
        return;
      }

      try {
        const [clubResponse, usersResponse] = await Promise.all([
          api.get(`/clubs/${actualClubId}`),
          api.get(`/clubs/${actualClubId}/team-users`)
        ]);

        const clubData = getResponseData(clubResponse);
        const usersData = getResponseData(usersResponse);

        setClubName(clubData.name || 'Tu Club');
        setTeamUsers(usersData || []);
        setFilteredUsers(usersData || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [actualClubId, userRole, navigate]);

  useEffect(() => {
    let filtered = [...teamUsers];

    if (activeFilter === 'activo') {
      filtered = filtered.filter(u => u.status === 'activo');
    } else if (activeFilter === 'inactivo') {
      filtered = filtered.filter(u => u.status === 'inactivo');
    }

    if (activeFilter !== 'todos' && activeFilter !== 'activo' && activeFilter !== 'inactivo') {
      filtered = filtered.filter(u => u.role === activeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [activeFilter, searchTerm, teamUsers]);

  const roles = Array.from(new Set(teamUsers.map(u => u.role)));

  const handleAddUser = () => {
    alert('Funcionalidad de agregar usuario (simulada para backend)');
  };

  const handleEditUser = (teamUser: TeamUser) => {
    alert(`Editando ${teamUser.name} (simulado)`);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('¿Confirmar eliminación?')) {
      try {
        await api.delete(`/clubs/${actualClubId}/team-users/${userId}`);
        setTeamUsers(prev => prev.filter(u => u.id !== userId));
        alert('Usuario eliminado');
      } catch (error) {
        console.error("Error deleting user:", error);
        alert('Error al eliminar usuario');
      }
    }
  };

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

  if (loading) {
    return <div className="text-center py-20">Cargando usuarios...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <UsersSidebar
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            roles={roles}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>

        <div className="lg:w-3/4 bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestionar Usuarios y Roles - {clubName}</h1>
          <p className="text-gray-600 mb-6">Total usuarios en equipo: {teamUsers.length}. Filtrados: {filteredUsers.length}.</p>

          <button
            onClick={handleAddUser}
            className="mb-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Agregar Nuevo Miembro al Equipo
          </button>

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
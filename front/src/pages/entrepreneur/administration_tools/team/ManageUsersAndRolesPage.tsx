import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../App';
import UsersSidebar from '../../../../components/entrepreneur/UsersSidebar';
import api, { getResponseData } from '../../../../api/config';
import { TeamUser } from '../../../../types/financial';

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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        toast.error('No se pudo cargar el equipo del club.');
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

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('¿Confirmar eliminación de este miembro del equipo?')) return;
    setDeletingId(userId);
    try {
      await api.delete(`/clubs/${actualClubId}/team-users/${userId}`);
      setTeamUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('Usuario eliminado correctamente.');
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error('Error al eliminar el usuario.');
    } finally {
      setDeletingId(null);
    }
  };

  const renderUserRow = (teamUser: TeamUser) => (
    <tr key={teamUser.id} className="border-b border-aurora-navy/10 hover:bg-aurora-cream/60">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-aurora-navy">{teamUser.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-aurora-navy/60">{teamUser.email}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            teamUser.role === 'administrador_del_club' ? 'bg-aurora-navy/10 text-aurora-navy' :
            teamUser.role === 'delivery_rider' ? 'bg-green-100 text-green-800' :
            teamUser.role.includes('moderador') ? 'bg-aurora-gold/20 text-aurora-terracottaDark' :
            'bg-gray-100 text-gray-700'
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
      <td className="px-6 py-4 whitespace-nowrap text-sm text-aurora-navy/60">
        {new Date(teamUser.assignedDate).toLocaleDateString('es-AR')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          disabled
          title="Función en desarrollo"
          className="text-aurora-navy/30 mr-3 cursor-not-allowed"
        >
          Editar
        </button>
        <button
          onClick={() => handleDeleteUser(teamUser.id)}
          disabled={deletingId === teamUser.id}
          className="text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          {deletingId === teamUser.id ? 'Eliminando...' : 'Eliminar'}
        </button>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-aurora-cream">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-aurora-navy/15 border-t-aurora-terracotta" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-aurora-cream">
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

        <div className="lg:w-3/4 bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-8">
          <h1 className="font-display text-3xl font-bold text-aurora-navy mb-2">Gestionar Usuarios y Roles — {clubName}</h1>
          <p className="text-aurora-navy/60 mb-6">Total usuarios en equipo: {teamUsers.length}. Filtrados: {filteredUsers.length}.</p>

          <button
            disabled
            title="Función en desarrollo"
            className="mb-6 inline-flex items-center gap-2 bg-aurora-navy/10 text-aurora-navy/50 px-4 py-2 rounded-lg cursor-not-allowed"
          >
            Agregar Nuevo Miembro al Equipo
            <span className="text-xs bg-aurora-gold/20 text-aurora-terracottaDark px-2 py-0.5 rounded-full font-semibold">Próximamente</span>
          </button>

          <div className="overflow-x-auto rounded-xl border border-aurora-navy/10">
            <table className="min-w-full divide-y divide-aurora-navy/10">
              <thead className="bg-aurora-cream">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-aurora-navy/50 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-aurora-navy/50 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-aurora-navy/50 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-aurora-navy/50 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-aurora-navy/50 uppercase tracking-wider">Fecha Asignado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-aurora-navy/50 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-aurora-navy/10">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(renderUserRow)
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-aurora-navy/40">No hay usuarios que coincidan con los filtros.</td>
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
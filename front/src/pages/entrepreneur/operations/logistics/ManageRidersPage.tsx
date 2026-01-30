import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Rider } from '../../../../types/delivery';
import ridersData from '../../../../data/riders.json';
import { useAuth } from '../../../../App';
import clubsData from '../../../../data/clubs.json';
import { Club } from '../../../../types/club';

const ManageRidersPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user } = useAuth();
  const [riders, setRiders] = useState<Rider[]>([]);
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRider, setNewRider] = useState<Partial<Rider>>({
    name: '',
    email: '',
    phoneNumber: '',
    vehicleType: 'moto',
    licensePlate: '',
    availability: true,
    zonesCovered: ['CABA'],
    isActive: true
  });
  const [editingRider, setEditingRider] = useState<Rider | null>(null);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        let clubRiders = (ridersData as Rider[]).filter(r => r.isActive).map(r => ({
          ...r,
          licensePlate: r.licensePlate === null ? undefined : r.licensePlate
        }));
        setRiders(clubRiders);

        const foundClub = (clubsData as Club[]).find(c => c.id === clubId);
        if (foundClub && user?.managedClubId === clubId) {
          setClub(foundClub);
        } else {
          setError('No tienes acceso a este club.');
        }
      } catch (err) {
        setError('Error al cargar riders.');
      } finally {
        setLoading(false);
      }
    };

    if (clubId && user?.managedClubId === clubId) {
      fetchData();
    }
  }, [clubId, user]);

  const addRider = () => {
    if (!newRider.name || !newRider.email || !newRider.phoneNumber) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }
    const riderToAdd: Rider = {
      id: `rider-${Date.now()}`,
      name: newRider.name as string,
      email: newRider.email as string,
      phoneNumber: newRider.phoneNumber as string,
      vehicleType: newRider.vehicleType as Rider['vehicleType'],
      licensePlate: newRider.licensePlate || undefined,
      availability: newRider.availability ?? true,
      rating: 0,
      totalDeliveries: 0,
      currentAssignments: 0,
      zonesCovered: newRider.zonesCovered as string[] || ['CABA'],
      isActive: newRider.isActive ?? true,
      createdAt: new Date().toISOString()
    };
    setRiders(prev => [...prev, riderToAdd]);
    setNewRider({
      name: '',
      email: '',
      phoneNumber: '',
      vehicleType: 'moto',
      licensePlate: '',
      availability: true,
      zonesCovered: ['CABA'],
      isActive: true
    });
    alert('Rider agregado exitosamente.');
  };

  const updateRider = (updatedRider: Rider) => {
    setRiders(prev => prev.map(r => r.id === updatedRider.id ? updatedRider : r));
    setEditingRider(null);
    alert('Rider actualizado exitosamente.');
  };

  const deleteRider = (riderId: string) => {
    if (window.confirm('¿Estás seguro de eliminar este rider? Esto lo desactivará.')) {
      setRiders(prev => prev.map(r => r.id === riderId ? { ...r, isActive: false } : r));
      alert('Rider desactivado.');
    }
  };

  const filteredRiders = riders
    .filter(r => filterActive === 'all' || (filterActive === 'active' ? r.isActive : !r.isActive))
    .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.email.toLowerCase().includes(searchTerm.toLowerCase()));

  const stats = {
    total: riders.length,
    active: riders.filter(r => r.isActive).length,
    inactive: riders.filter(r => !r.isActive).length
  };

  if (loading) return <div className="text-center py-10">Cargando riders...</div>;
  if (error || !club) return <div className="text-center py-10 text-red-500">{error || 'Club no encontrado.'}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gestionar Riders - {club.name}</h1>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Riders</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Activos</h3>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Inactivos</h3>
          <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select 
          value={filterActive} 
          onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos</option>
          <option value="active">Solo Activos</option>
          <option value="inactive">Solo Inactivos</option>
        </select>
      </div>

      <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Agregar Nuevo Rider</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Nombre Completo"
            value={newRider.name || ''}
            onChange={(e) => setNewRider({ ...newRider, name: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newRider.email || ''}
            onChange={(e) => setNewRider({ ...newRider, email: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="tel"
            placeholder="Teléfono"
            value={newRider.phoneNumber || ''}
            onChange={(e) => setNewRider({ ...newRider, phoneNumber: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <select
            value={newRider.vehicleType || 'moto'}
            onChange={(e) => setNewRider({ ...newRider, vehicleType: e.target.value as Rider['vehicleType'] })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="moto">Moto</option>
            <option value="auto">Auto</option>
            <option value="bicicleta">Bicicleta</option>
            <option value="a_pie">A Pie</option>
          </select>
          <input
            type="text"
            placeholder="Patente (opcional)"
            value={newRider.licensePlate || ''}
            onChange={(e) => setNewRider({ ...newRider, licensePlate: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newRider.availability ? 'true' : 'false'}
            onChange={(e) => setNewRider({ ...newRider, availability: e.target.value === 'true' })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="true">Disponible</option>
            <option value="false">No Disponible</option>
          </select>
          <input
            type="text"
            placeholder="Zonas (separadas por coma, ej: CABA,GBA)"
            value={(newRider.zonesCovered || []).join(',')}
            onChange={(e) => setNewRider({ ...newRider, zonesCovered: e.target.value.split(',') })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newRider.isActive || false}
                onChange={(e) => setNewRider({ ...newRider, isActive: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm">Activo</span>
            </label>
          </div>
        </div>
        <button 
          onClick={addRider}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Agregar Rider
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Lista de Riders ({filteredRiders.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponible</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calificación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignaciones</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zonas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRiders.map((rider) => (
                <tr key={rider.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rider.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rider.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rider.phoneNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rider.vehicleType.toUpperCase()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${rider.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {rider.availability ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rider.rating}/5</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rider.currentAssignments}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={rider.zonesCovered.join(', ')}>
                    {rider.zonesCovered.join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${rider.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {rider.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => setEditingRider(rider)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => deleteRider(rider.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingRider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Editar Rider: {editingRider.name}</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={editingRider.name}
                onChange={(e) => setEditingRider({ ...editingRider, name: e.target.value })}
                placeholder="Nombre"
                className="w-full px-3 py-2 border rounded-md"
              />
              <input
                type="email"
                value={editingRider.email}
                onChange={(e) => setEditingRider({ ...editingRider, email: e.target.value })}
                placeholder="Email"
                className="w-full px-3 py-2 border rounded-md"
              />
              <input
                type="tel"
                value={editingRider.phoneNumber}
                onChange={(e) => setEditingRider({ ...editingRider, phoneNumber: e.target.value })}
                placeholder="Teléfono"
                className="w-full px-3 py-2 border rounded-md"
              />
              <select
                value={editingRider.vehicleType}
                onChange={(e) => setEditingRider({ ...editingRider, vehicleType: e.target.value as Rider['vehicleType'] })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="moto">Moto</option>
                <option value="auto">Auto</option>
                <option value="bicicleta">Bicicleta</option>
                <option value="a_pie">A Pie</option>
              </select>
              <input
                type="text"
                value={editingRider.licensePlate || ''}
                onChange={(e) => setEditingRider({ ...editingRider, licensePlate: e.target.value })}
                placeholder="Patente (opcional)"
                className="w-full px-3 py-2 border rounded-md"
              />
              <select
                value={editingRider.availability ? 'true' : 'false'}
                onChange={(e) => setEditingRider({ ...editingRider, availability: e.target.value === 'true' })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="true">Disponible</option>
                <option value="false">No Disponible</option>
              </select>
              <input
                type="text"
                value={editingRider.zonesCovered.join(',')}
                onChange={(e) => setEditingRider({ ...editingRider, zonesCovered: e.target.value.split(',') })}
                placeholder="Zonas (separadas por coma)"
                className="w-full px-3 py-2 border rounded-md"
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={editingRider.isActive}
                  onChange={(e) => setEditingRider({ ...editingRider, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-sm">Activo</span>
              </label>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setEditingRider(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button 
                onClick={() => updateRider(editingRider)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredRiders.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No hay riders que coincidan con los filtros actuales.
        </div>
      )}
    </div>
  );
};

export default ManageRidersPage;
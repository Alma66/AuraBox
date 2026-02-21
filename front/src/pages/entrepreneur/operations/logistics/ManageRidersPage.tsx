import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../App';
import api, { getResponseData } from '../../../../api/config';
import { Rider } from '../../../../types/delivery';
import { Club } from '../../../../types/club';

const ManageRidersPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [riders, setRiders] = useState<Rider[]>([]);
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRider, setNewRider] = useState<Partial<Rider>>({
    name: '', email: '', phoneNumber: '', vehicleType: 'moto', licensePlate: '', availability: true, zonesCovered: ['CABA'], isActive: true
  });
  const [editingRider, setEditingRider] = useState<Rider | null>(null);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!clubId || userRole !== 'entrepreneur' || user?.managedClubId !== clubId) {
        navigate('/login');
        return;
      }

      try {
        const [clubResponse, ridersResponse] = await Promise.all([
          api.get(`/clubs/${clubId}`),
          api.get(`/clubs/${clubId}/riders`)
        ]);

        const clubData = getResponseData(clubResponse);
        const ridersData = getResponseData(ridersResponse);

        setClub(clubData);
        setRiders(ridersData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError('Error al cargar riders.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clubId, user, userRole, navigate]);

  const addRider = async () => {
    if (!newRider.name || !newRider.email || !newRider.phoneNumber) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }
    try {
      const response = await api.post(`/clubs/${clubId}/riders`, newRider);
      const created = getResponseData(response);
      setRiders(prev => [...prev, created]);
      setNewRider({ name: '', email: '', phoneNumber: '', vehicleType: 'moto', licensePlate: '', availability: true, zonesCovered: ['CABA'], isActive: true });
      alert('Rider agregado.');
    } catch (err) {
      console.error("Error adding rider:", err);
      alert('Error al agregar rider.');
    }
  };

  const updateRider = async (updatedRider: Rider) => {
    try {
      await api.put(`/clubs/${clubId}/riders/${updatedRider.id}`, updatedRider);
      setRiders(prev => prev.map(r => r.id === updatedRider.id ? updatedRider : r));
      setEditingRider(null);
      alert('Rider actualizado.');
    } catch (err) {
      console.error("Error updating rider:", err);
      alert('Error al actualizar.');
    }
  };

  const deleteRider = async (riderId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este rider?')) return;
    try {
      await api.delete(`/clubs/${clubId}/riders/${riderId}`);
      setRiders(prev => prev.map(r => r.id === riderId ? { ...r, isActive: false } : r));
      alert('Rider eliminado.');
    } catch (err) {
      console.error("Error deleting rider:", err);
      alert('Error al eliminar.');
    }
  };

  const filteredRiders = riders
    .filter(r => filterActive === 'all' || (filterActive === 'active' ? r.isActive : !r.isActive))
    .filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.email.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <div className="text-center py-10">Cargando riders...</div>;
  if (error || !club) return <div className="text-center py-10 text-red-500">{error || 'Club no encontrado.'}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gestionar Riders - {club.name}</h1>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow"><h3 className="text-sm font-medium text-gray-500">Total</h3><p className="text-2xl font-bold">{riders.length}</p></div>
        <div className="bg-white p-4 rounded-lg shadow"><h3 className="text-sm font-medium text-gray-500">Activos</h3><p className="text-2xl font-bold text-green-600">{riders.filter(r => r.isActive).length}</p></div>
        <div className="bg-white p-4 rounded-lg shadow"><h3 className="text-sm font-medium text-gray-500">Inactivos</h3><p className="text-2xl font-bold text-red-600">{riders.filter(r => !r.isActive).length}</p></div>
      </div>

      <div className="mb-6 flex gap-4">
        <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-4 py-2 border rounded-md" />
        <select value={filterActive} onChange={(e) => setFilterActive(e.target.value as any)} className="px-4 py-2 border rounded-md">
          <option value="all">Todos</option>
          <option value="active">Solo Activos</option>
          <option value="inactive">Solo Inactivos</option>
        </select>
      </div>

      <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Agregar Rider</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input type="text" placeholder="Nombre" value={newRider.name || ''} onChange={(e) => setNewRider({ ...newRider, name: e.target.value })} className="px-3 py-2 border rounded-md" required />
          <input type="email" placeholder="Email" value={newRider.email || ''} onChange={(e) => setNewRider({ ...newRider, email: e.target.value })} className="px-3 py-2 border rounded-md" required />
          <input type="tel" placeholder="Teléfono" value={newRider.phoneNumber || ''} onChange={(e) => setNewRider({ ...newRider, phoneNumber: e.target.value })} className="px-3 py-2 border rounded-md" required />
          <select value={newRider.vehicleType || 'moto'} onChange={(e) => setNewRider({ ...newRider, vehicleType: e.target.value as any })} className="px-3 py-2 border rounded-md">
            <option value="moto">Moto</option>
            <option value="auto">Auto</option>
            <option value="bicicleta">Bicicleta</option>
            <option value="a_pie">A Pie</option>
          </select>
          <input type="text" placeholder="Patente" value={newRider.licensePlate || ''} onChange={(e) => setNewRider({ ...newRider, licensePlate: e.target.value })} className="px-3 py-2 border rounded-md" />
          <select value={newRider.availability ? 'true' : 'false'} onChange={(e) => setNewRider({ ...newRider, availability: e.target.value === 'true' })} className="px-3 py-2 border rounded-md">
            <option value="true">Disponible</option>
            <option value="false">No Disponible</option>
          </select>
          <input type="text" placeholder="Zonas (CABA,GBA)" value={(newRider.zonesCovered || []).join(',')} onChange={(e) => setNewRider({ ...newRider, zonesCovered: e.target.value.split(',') })} className="px-3 py-2 border rounded-md" />
          <div className="flex items-center"><label className="flex items-center"><input type="checkbox" checked={newRider.isActive || false} onChange={(e) => setNewRider({ ...newRider, isActive: e.target.checked })} className="mr-2" /><span>Activo</span></label></div>
        </div>
        <button onClick={addRider} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Agregar Rider</button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disponible</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calificación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRiders.map((rider) => (
                <tr key={rider.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{rider.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{rider.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{rider.phoneNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{rider.vehicleType.toUpperCase()}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs rounded-full ${rider.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{rider.availability ? 'Sí' : 'No'}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{rider.rating}/5</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs rounded-full ${rider.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{rider.isActive ? 'Activo' : 'Inactivo'}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => setEditingRider(rider)} className="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                    <button onClick={() => deleteRider(rider.id)} className="text-red-600 hover:text-red-900">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingRider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Editar Rider: {editingRider.name}</h2>
            <div className="space-y-4">
              <input type="text" value={editingRider.name} onChange={(e) => setEditingRider({ ...editingRider, name: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
              <input type="email" value={editingRider.email} onChange={(e) => setEditingRider({ ...editingRider, email: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
              <input type="tel" value={editingRider.phoneNumber} onChange={(e) => setEditingRider({ ...editingRider, phoneNumber: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
              <select value={editingRider.vehicleType} onChange={(e) => setEditingRider({ ...editingRider, vehicleType: e.target.value as any })} className="w-full px-3 py-2 border rounded-md">
                <option value="moto">Moto</option>
                <option value="auto">Auto</option>
                <option value="bicicleta">Bicicleta</option>
                <option value="a_pie">A Pie</option>
              </select>
              <input type="text" value={editingRider.licensePlate || ''} onChange={(e) => setEditingRider({ ...editingRider, licensePlate: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
              <select value={editingRider.availability ? 'true' : 'false'} onChange={(e) => setEditingRider({ ...editingRider, availability: e.target.value === 'true' })} className="w-full px-3 py-2 border rounded-md">
                <option value="true">Disponible</option>
                <option value="false">No Disponible</option>
              </select>
              <input type="text" value={editingRider.zonesCovered.join(',')} onChange={(e) => setEditingRider({ ...editingRider, zonesCovered: e.target.value.split(',') })} className="w-full px-3 py-2 border rounded-md" />
              <label className="flex items-center"><input type="checkbox" checked={editingRider.isActive} onChange={(e) => setEditingRider({ ...editingRider, isActive: e.target.checked })} className="mr-2" /><span>Activo</span></label>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setEditingRider(null)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">Cancelar</button>
              <button onClick={() => updateRider(editingRider)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRidersPage;
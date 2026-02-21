import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../App';
import api, { getResponseData } from '../../../../api/config';
import { Delivery, Rider } from '../../../../types/delivery';
import { Club } from '../../../../types/club';

const AssignDeliveriesPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending'>('all');
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!clubId || userRole !== 'entrepreneur' || user?.managedClubId !== clubId) {
        navigate('/login');
        return;
      }

      try {
        const [clubResponse, deliveriesResponse, ridersResponse] = await Promise.all([
          api.get(`/clubs/${clubId}`),
          api.get(`/clubs/${clubId}/deliveries`),
          api.get(`/clubs/${clubId}/riders`)
        ]);

        const clubData = getResponseData(clubResponse);
        const deliveriesData = getResponseData(deliveriesResponse);
        const ridersData = getResponseData(ridersResponse);

        setClub(clubData);
        setDeliveries(deliveriesData || []);
        setRiders(ridersData?.filter((r: Rider) => r.isActive && r.availability) || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError('Error al cargar datos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clubId, user, userRole, navigate]);

  const assignRiderToDelivery = async (deliveryId: string, riderId: string) => {
    try {
      await api.put(`/clubs/${clubId}/deliveries/${deliveryId}`, { assignedRiderId: riderId, status: 'assigned' });
      setDeliveries(prev => prev.map(d => d.id === deliveryId ? { ...d, assignedRiderId: riderId, status: 'assigned' as const } : d));
      const selectedRiderData = riders.find(r => r.id === riderId);
      if (selectedRiderData) setSelectedRider(selectedRiderData);
      alert('Entrega asignada correctamente.');
    } catch (error) {
      console.error("Error assigning rider:", error);
      alert('Error al asignar rider.');
    }
  };

  const unassignRider = async (deliveryId: string) => {
    try {
      await api.put(`/clubs/${clubId}/deliveries/${deliveryId}`, { assignedRiderId: null, status: 'pending' });
      setDeliveries(prev => prev.map(d => d.id === deliveryId ? { ...d, assignedRiderId: undefined, status: 'pending' as const } : d));
      setSelectedRider(null);
      alert('Entrega desasignada.');
    } catch (error) {
      console.error("Error unassigning rider:", error);
    }
  };

  if (loading) return <div className="text-center py-10">Cargando entregas...</div>;
  if (error || !club) return <div className="text-center py-10 text-red-500">{error || 'Club no encontrado.'}</div>;

  const filteredDeliveries = filterStatus === 'pending' ? deliveries.filter(d => d.status === 'pending') : deliveries;

  const getRiderName = (riderId: string | undefined) => {
    if (!riderId) return 'No asignado';
    const rider = riders.find(r => r.id === riderId);
    return rider ? rider.name : 'Rider desconocido';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Asignar Envíos - {club.name}</h1>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-4 py-2 border border-gray-300 rounded-md">
          <option value="all">Todas las entregas</option>
          <option value="pending">Solo pendientes</option>
        </select>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Rider</label>
          <select value={selectedRider?.id || ''} onChange={(e) => setSelectedRider(riders.find(r => r.id === e.target.value) || null)} className="w-full px-4 py-2 border border-gray-300 rounded-md">
            <option value="">-- Elegir Rider --</option>
            {riders.map(rider => (
              <option key={rider.id} value={rider.id}>{rider.name} ({rider.vehicleType}) - {rider.currentAssignments} asignaciones</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Riders Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {riders.map(rider => (
            <div key={rider.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <h3 className="font-medium">{rider.name}</h3>
              <p className="text-sm text-gray-600">{rider.vehicleType.toUpperCase()}</p>
              <p className="text-sm text-gray-500">Disponible: {rider.availability ? 'Sí' : 'No'}</p>
              <p className="text-sm text-gray-500">Calificación: {rider.rating}/5</p>
              <button onClick={() => setSelectedRider(rider)} className="mt-2 w-full bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700">Seleccionar</button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Entregas ({filteredDeliveries.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contenido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{delivery.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{delivery.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(delivery.deliveryDate).toLocaleDateString('es-AR')}</td>
                  <td className="px-6 py-4 text-sm max-w-xs truncate">{delivery.boxContent}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 text-xs rounded-full ${delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : delivery.status === 'assigned' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {delivery.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{getRiderName(delivery.assignedRiderId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {delivery.status === 'pending' && selectedRider && (
                      <button onClick={() => assignRiderToDelivery(delivery.id, selectedRider.id)} className="text-green-600 hover:text-green-900 mr-3">Asignar</button>
                    )}
                    {delivery.assignedRiderId && (
                      <button onClick={() => unassignRider(delivery.id)} className="text-red-600 hover:text-red-900">Desasignar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssignDeliveriesPage;
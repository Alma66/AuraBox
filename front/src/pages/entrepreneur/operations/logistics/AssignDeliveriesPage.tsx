import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Delivery, Rider } from '../../../../types/delivery';
import deliveriesData from '../../../../data/deliveries.json';
import ridersData from '../../../../data/riders.json';
import clubsData from '../../../../data/clubs.json';
import { Club } from '../../../../types/club';
import { useAuth } from '../../../../App';

const AssignDeliveriesPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending'>('all');
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const normalizedDeliveries = (deliveriesData as Delivery[]).map(d => ({
          ...d,
          assignedRiderId: d.assignedRiderId === null ? undefined : d.assignedRiderId,
          trackingNumber: d.trackingNumber === null ? undefined : d.trackingNumber
        })).filter(d => d.clubId === clubId);
        setDeliveries(normalizedDeliveries);

        const availableRiders = (ridersData as Rider[]).filter(r => r.isActive && r.availability).map(r => ({
          ...r,
          licensePlate: r.licensePlate === null ? undefined : r.licensePlate
        }));
        setRiders(availableRiders);

        const foundClub = (clubsData as Club[]).find(c => c.id === clubId);
        if (foundClub && user?.managedClubId === clubId) {
          setClub(foundClub);
        } else {
          setError('No tienes acceso a este club o no existe.');
        }
      } catch (err) {
        setError('Error al cargar datos.');
      } finally {
        setLoading(false);
      }
    };

    if (clubId && user?.managedClubId === clubId) {
      fetchData();
    }
  }, [clubId, user]);

  const assignRiderToDelivery = (deliveryId: string, riderId: string) => {
    setDeliveries(prev => prev.map(d => 
      d.id === deliveryId 
        ? { ...d, assignedRiderId: riderId, status: 'assigned' as const, updatedAt: new Date().toISOString() }
        : d
    ));
    const selectedRiderData = riders.find(r => r.id === riderId);
    if (selectedRiderData) {
      setRiders(prev => prev.map(r => 
        r.id === riderId ? { ...r, currentAssignments: r.currentAssignments + 1 } : r
      ));
      setSelectedRider(selectedRiderData);
    }
    alert(`Entrega ${deliveryId} asignada a rider ${riderId}`);
  };

  const unassignRider = (deliveryId: string) => {
    setDeliveries(prev => prev.map(d => 
      d.id === deliveryId 
        ? { ...d, assignedRiderId: undefined, status: 'pending' as const, updatedAt: new Date().toISOString() } 
        : d
    ));
    if (selectedRider) {
      setRiders(prev => prev.map(r => 
        r.id === selectedRider.id ? { ...r, currentAssignments: Math.max(0, r.currentAssignments - 1) } : r
      ));
      setSelectedRider(null);
    }
    alert(`Entrega ${deliveryId} desasignada.`);
  };

  if (loading) return <div className="text-center py-10">Cargando entregas...</div>;
  if (error || !club) return <div className="text-center py-10 text-red-500">{error || 'Club no encontrado.'}</div>;

  const filteredDeliveries = filterStatus === 'pending' 
    ? deliveries.filter(d => d.status === 'pending')
    : deliveries;

  const getRiderName = (riderId: string | undefined) => {
    if (!riderId) return 'No asignado';
    const rider = riders.find(r => r.id === riderId);
    return rider ? rider.name : 'Rider desconocido';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Asignar Envíos - {club.name}</h1>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending')}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas las entregas</option>
          <option value="pending">Solo pendientes</option>
        </select>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Rider para Asignación Masiva</label>
          <select 
            value={selectedRider?.id || ''} 
            onChange={(e) => setSelectedRider(riders.find(r => r.id === e.target.value) || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Elegir Rider --</option>
            {riders.map(rider => (
              <option key={rider.id} value={rider.id}>
                {rider.name} ({rider.vehicleType}) - {rider.currentAssignments} asignaciones activas
              </option>
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
              <p className="text-sm text-gray-500">Asignaciones: {rider.currentAssignments}</p>
              <button 
                onClick={() => setSelectedRider(rider)}
                className="mt-2 w-full bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700"
              >
                Seleccionar
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Entregas Pendientes/Asignadas ({filteredDeliveries.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Entrega</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contenido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rider Asignado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{delivery.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {delivery.userId} 
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(delivery.deliveryDate).toLocaleDateString('es-AR')}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={delivery.boxContent}>
                    {delivery.boxContent}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {delivery.address.street} {delivery.address.number}, {delivery.address.locality}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      delivery.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                      delivery.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {delivery.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getRiderName(delivery.assignedRiderId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {delivery.status === 'pending' && selectedRider && (
                      <button
                        onClick={() => assignRiderToDelivery(delivery.id, selectedRider.id)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Asignar
                      </button>
                    )}
                    {delivery.assignedRiderId && (
                      <button
                        onClick={() => unassignRider(delivery.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Desasignar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredDeliveries.length === 0 && (
        <div className="text-center py-10 text-gray-500">No hay entregas para mostrar con el filtro actual.</div>
      )}
    </div>
  );
};

export default AssignDeliveriesPage;
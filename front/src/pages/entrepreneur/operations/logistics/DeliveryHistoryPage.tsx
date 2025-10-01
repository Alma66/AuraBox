import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Delivery, DeliveryHistoryEntry } from '../../../../types/delivery';
import { Subscription } from '../../../../types/subscription';
import deliveriesData from '../../../../data/deliveries.json';
import clubsData from '../../../../data/clubs.json';
import usersData from '../../../../data/user.json';
import { Club } from '../../../../types/club';
import { User } from '../../../../types/user';
import { useAuth } from '../../../../App';

const DeliveryHistoryPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user } = useAuth();
  const [history, setHistory] = useState<DeliveryHistoryEntry[]>([]);
  const [club, setClub] = useState<Club | null>(null);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState<'all' | 'delivered' | 'failed'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const normalizedDeliveries: Delivery[] = (deliveriesData as Delivery[]).map((d: Delivery) => ({
          ...d,
          assignedRiderId: d.assignedRiderId === null ? undefined : d.assignedRiderId,
          trackingNumber: d.trackingNumber === null ? undefined : d.trackingNumber
        })).filter((d: Delivery) => d.clubId === clubId);

        let enrichedHistory: DeliveryHistoryEntry[] = normalizedDeliveries.map((delivery: Delivery) => ({
          ...delivery,
          user: ((usersData as User[]).find((u: User) => u.id === delivery.userId) || { firstName: 'Cliente', lastName: 'Anónimo', email: 'N/A' }) as Partial<User>,
          club: ((clubsData as Club[]).find((c: Club) => c.id === delivery.clubId) || {}) as Partial<Club>,
          subscription: { 
            planId: delivery.planId, 
            status: 'active' as const 
          } as Partial<Subscription>
        }));

        if (filterStatus !== 'all') {
          enrichedHistory = enrichedHistory.filter(d => d.status === filterStatus);
        }

        const yearFiltered: DeliveryHistoryEntry[] = enrichedHistory.filter(d => new Date(d.deliveryDate).getFullYear() === filterYear);

        yearFiltered.sort((a, b) => new Date(b.deliveryDate).getTime() - new Date(a.deliveryDate).getTime());

        setHistory(yearFiltered);

        const foundClub = (clubsData as Club[]).find(c => c.id === clubId);
        if (foundClub && user?.managedClubId === clubId) {
          setClub(foundClub);
        } else {
          setError('No tienes acceso a este club.');
        }
      } catch (err) {
        setError('Error al cargar historial.');
      } finally {
        setLoading(false);
      }
    };

    if (clubId && user?.managedClubId === clubId) {
      fetchData();
    }
  }, [clubId, user, filterYear, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID Entrega,Fecha,Cliente,Email,Estado,Proveedor,Contenido,Costo,Notas\n"
      + history.map(h => 
          `"${h.id}","${new Date(h.deliveryDate).toLocaleDateString('es-AR')}","${h.user.firstName} ${h.user.lastName}","${h.user.email}","${h.status}","${h.shippingProvider.replace('_', ' ').toUpperCase()}","${h.boxContent}","${h.cost}","${h.notes || 'N/A'}"`
        ).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `historial_entregas_${club?.name.replace(/\s+/g, '_')}_${filterYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = {
    total: history.length,
    delivered: history.filter(h => h.status === 'delivered').length,
    failed: history.filter(h => h.status === 'failed').length,
    successRate: history.length > 0 ? ((history.filter(h => h.status === 'delivered').length / history.length) * 100).toFixed(1) : '0'
  };

  if (loading) return <div className="text-center py-10">Cargando historial...</div>;
  if (error || !club) return <div className="text-center py-10 text-red-500">{error || 'Club no encontrado.'}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Historial de Entregas - {club.name}</h1>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Entregas</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Entregadas</h3>
          <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Fallidas</h3>
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Tasa Éxito</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.successRate}%</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <select 
          value={filterYear} 
          onChange={(e) => setFilterYear(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[2023, 2024, 2025].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'delivered' | 'failed')}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los Estados</option>
          <option value="delivered">Solo Entregadas</option>
          <option value="failed">Solo Fallidas</option>
        </select>
        <button 
          onClick={exportToCSV}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Exportar a CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Historial Completo ({history.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Entrega</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contenido Caja</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Envío</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(entry.deliveryDate).toLocaleDateString('es-AR', { 
                      year: 'numeric', month: 'long', day: 'numeric' 
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entry.user.firstName} {entry.user.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate" title={entry.boxContent}>
                    {entry.boxContent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                      {entry.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.shippingProvider.replace('_', ' ').toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${entry.cost.toLocaleString('es-AR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={entry.notes || 'Sin notas'}>
                    {entry.notes || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Ver Detalles</button>
                    {entry.trackingNumber && (
                      <a href={`https://www.correoargentino.com.ar/seguimiento?numero=${entry.trackingNumber}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-900">
                        Tracking
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {history.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No hay entregas en el historial para {filterYear} con el filtro actual.
          <br />Intenta cambiar el año o estado.
        </div>
      )}
    </div>
  );
};

export default DeliveryHistoryPage;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../App';
import api, { getResponseData } from '../../../../api/config';
import { Shipment } from '../../../../types/delivery';
import { Club } from '../../../../types/club';

const DeliveryHistoryPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<Shipment[]>([]);
  const [club, setClub] = useState<Club | null>(null);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState<'all' | 'Entregado' | 'Problema'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!clubId || userRole !== 'entrepreneur' || user?.managedClubId !== clubId) {
        navigate('/login');
        return;
      }

      try {
        const [clubResponse, deliveriesResponse] = await Promise.all([
          api.get(`/clubs/${clubId}`),
          api.get(`/clubs/${clubId}/deliveries`),
        ]);

        const clubData = getResponseData(clubResponse);
        const deliveriesData: Shipment[] = getResponseData(deliveriesResponse) || [];

        if (!clubData) {
          setError('Club no encontrado.');
          setLoading(false);
          return;
        }

        setClub(clubData);

        let filtered = deliveriesData.filter((d) => {
          const refDate = d.actualDeliveryDate || d.estimatedDeliveryStartDate;
          return refDate ? new Date(refDate).getFullYear() === filterYear : false;
        });
        if (filterStatus !== 'all') filtered = filtered.filter((d) => d.shipmentStatus === filterStatus);
        filtered.sort((a, b) => {
          const dateA = new Date(a.actualDeliveryDate || a.estimatedDeliveryStartDate || 0).getTime();
          const dateB = new Date(b.actualDeliveryDate || b.estimatedDeliveryStartDate || 0).getTime();
          return dateB - dateA;
        });
        setHistory(filtered);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar historial.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clubId, user, userRole, navigate, filterYear, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Entregado':
        return 'bg-green-100 text-green-800';
      case 'Problema':
        return 'bg-red-100 text-red-800';
      case 'En_Camino':
        return 'bg-blue-100 text-blue-800';
      case 'Asignado':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const exportToCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Fecha,Cliente,Estado,Proveedor,Contenido,Costo\n' +
      history
        .map((h) => {
          const date = h.actualDeliveryDate || h.estimatedDeliveryStartDate;
          const clientName = h.user ? `${h.user.firstName} ${h.user.lastName}` : h.idUser;
          return `"${h.id}","${date ? new Date(date).toLocaleDateString('es-AR') : ''}","${clientName}","${h.shipmentStatus}","${h.logisticsCompany || ''}","${h.boxContent || ''}","${h.shippingCost || ''}"`;
        })
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `historial_${club?.name}_${filterYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="text-center py-10">Cargando historial...</div>;
  if (error || !club) return <div className="text-center py-10 text-red-500">{error || 'Club no encontrado.'}</div>;

  const stats = {
    total: history.length,
    delivered: history.filter((h) => h.shipmentStatus === 'Entregado').length,
    failed: history.filter((h) => h.shipmentStatus === 'Problema').length,
    successRate:
      history.length > 0
        ? ((history.filter((h) => h.shipmentStatus === 'Entregado').length / history.length) * 100).toFixed(1)
        : '0',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Historial de Entregas - {club.name}</h1>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total</h3>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Entregadas</h3>
          <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Con problemas</h3>
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Tasa Éxito</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.successRate}%</p>
        </div>
      </div>

      <div className="mb-6 flex gap-4 flex-wrap">
        <select value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))} className="px-4 py-2 border rounded-md">
          {[2023, 2024, 2025, 2026].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-4 py-2 border rounded-md">
          <option value="all">Todos los Estados</option>
          <option value="Entregado">Solo Entregadas</option>
          <option value="Problema">Solo con Problemas</option>
        </select>
        <button onClick={exportToCSV} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          Exportar a CSV
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contenido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proveedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notas</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((entry) => {
                const date = entry.actualDeliveryDate || entry.estimatedDeliveryStartDate;
                return (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {date ? new Date(date).toLocaleDateString('es-AR') : 'Sin fecha'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {entry.user ? `${entry.user.firstName} ${entry.user.lastName}` : entry.idUser}
                    </td>
                    <td className="px-6 py-4 text-sm max-w-xs truncate">{entry.boxContent || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 text-xs rounded-full ${getStatusColor(entry.shipmentStatus)}`}>
                        {entry.shipmentStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{(entry.logisticsCompany || 'N/A').toUpperCase()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      ${entry.shippingCost ? Number(entry.shippingCost).toLocaleString('es-AR') : '0'}
                    </td>
                    <td className="px-6 py-4 text-sm max-w-xs truncate">{entry.shippingNotes || 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {history.length === 0 && <div className="text-center py-10 text-gray-500">No hay entregas en el historial.</div>}
    </div>
  );
};

export default DeliveryHistoryPage;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../App';
import api, { getResponseData } from '../../../../api/config';
import { Delivery } from '../../../../types/delivery';
import { Club } from '../../../../types/club';

const ViewDeliveriesPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [club, setClub] = useState<Club | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');

  useEffect(() => {
    const fetchData = async () => {
      if (!clubId || userRole !== 'entrepreneur' || user?.managedClubId !== clubId) {
        navigate('/login');
        return;
      }

      try {
        const [clubResponse, deliveriesResponse] = await Promise.all([
          api.get(`/clubs/${clubId}`),
          api.get(`/clubs/${clubId}/deliveries`)
        ]);

        const clubData = getResponseData(clubResponse);
        const deliveriesData = getResponseData(deliveriesResponse);

        if (!clubData) {
          setError('Club no encontrado.');
          setLoading(false);
          return;
        }

        setClub(clubData);

        const monthDeliveries = (deliveriesData || []).filter((d: Delivery) => 
          new Date(d.deliveryDate).getMonth() + 1 === selectedMonth &&
          new Date(d.deliveryDate).getFullYear() === selectedYear
        );

        setDeliveries(monthDeliveries);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError('Error al cargar entregas.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clubId, user, userRole, navigate, selectedMonth, selectedYear]);

  const getDaysWithDeliveries = () => {
    const days = new Set<number>();
    deliveries.forEach(d => {
      const day = new Date(d.deliveryDate).getDate();
      days.add(day);
    });
    return Array.from(days);
  };

  const daysWithDeliveries = getDaysWithDeliveries();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center py-10">Cargando entregas del mes...</div>;
  if (error || !club) return <div className="text-center py-10 text-red-500">{error || 'Club no encontrado.'}</div>;

  const monthName = new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(new Date(selectedYear, selectedMonth - 1, 1));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Ver Envíos del Mes - {club.name}</h1>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4">
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="px-4 py-2 border border-gray-300 rounded-md">
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(new Date(2024, i, 1))}
              </option>
            ))}
          </select>
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="px-4 py-2 border border-gray-300 rounded-md">
            {[2023, 2024, 2025].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCalendarView('month')} className={`px-4 py-2 rounded-md ${calendarView === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Vista Mensual</button>
          <button onClick={() => setCalendarView('week')} className={`px-4 py-2 rounded-md ${calendarView === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Vista Semanal</button>
        </div>
        <p className="text-sm text-gray-600">Entregas en {monthName} {selectedYear}: {deliveries.length}</p>
      </div>

      {calendarView === 'month' && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Calendario de Entregas - {monthName} {selectedYear}</h2>
          <div className="grid grid-cols-7 gap-1 bg-gray-100 p-4 rounded-lg">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="text-center font-medium text-gray-600 py-2">{day}</div>
            ))}
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const hasDelivery = daysWithDeliveries.includes(day);
              const isToday = day === new Date().getDate() && selectedMonth === new Date().getMonth() + 1 && selectedYear === new Date().getFullYear();
              return (
                <div key={day} className={`text-center py-2 px-1 rounded cursor-pointer ${hasDelivery ? 'bg-blue-200 text-blue-800 font-semibold' : isToday ? 'bg-yellow-200 text-yellow-800' : 'text-gray-600 hover:bg-gray-200'}`}>
                  {day}
                  {hasDelivery && <div className="text-xs mt-1">●</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {calendarView === 'week' && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Entregas Semanales - {monthName} {selectedYear}</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(week => (
              <div key={week} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium mb-2">Semana {week} ({(week-1)*7 + 1} - {Math.min(week*7, 31)})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deliveries.filter(d => {
                    const day = new Date(d.deliveryDate).getDate();
                    return day >= (week-1)*7 + 1 && day <= Math.min(week*7, 31);
                  }).map(delivery => (
                    <div key={delivery.id} className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">{new Date(delivery.deliveryDate).toLocaleDateString('es-AR')}</p>
                      <p className="text-sm text-gray-600">{delivery.boxContent}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getStatusColor(delivery.status)}`}>{delivery.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Detalles de Entregas ({deliveries.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contenido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proveedor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(delivery.deliveryDate).toLocaleDateString('es-AR')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{delivery.userId}</td>
                  <td className="px-6 py-4 text-sm max-w-xs truncate">{delivery.boxContent}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(delivery.status)}`}>{delivery.status.toUpperCase()}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{delivery.shippingProvider.replace('_', ' ').toUpperCase()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">${delivery.cost.toLocaleString('es-AR')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Ver Detalles</button>
                    <button className="text-green-600 hover:text-green-900">Imprimir Etiqueta</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deliveries.length === 0 && (
        <div className="text-center py-10 text-gray-500">No hay entregas programadas para {monthName} {selectedYear}.</div>
      )}
    </div>
  );
};

export default ViewDeliveriesPage;
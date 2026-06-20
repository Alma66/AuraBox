import React, { useEffect, useMemo, useState } from 'react';
import api, { getResponseData } from '../../../api/config';
import { Shipment, ShipmentStatusValue } from '../../../types/delivery';

interface ShipmentsListViewProps {
  clubId: string;
  clubName: string;
  title: string;
  defaultRangeDays: number | null;
}

const STATUS_OPTIONS: { value: ShipmentStatusValue | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'Asignado', label: 'Asignado' },
  { value: 'En_Camino', label: 'En camino' },
  { value: 'Entregado', label: 'Entregado' },
  { value: 'Problema', label: 'Con problema' },
  { value: 'Devuelto', label: 'Devuelto' },
];

const getStatusColor = (status: ShipmentStatusValue) => {
  switch (status) {
    case 'Pendiente': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Asignado': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'En_Camino': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Entregado': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Problema': return 'bg-red-50 text-red-700 border-red-200';
    case 'Devuelto': return 'bg-gray-100 text-gray-700 border-gray-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

const formatAddress = (s: Shipment) => {
  const parts = [s.street && s.addressNumber ? `${s.street} ${s.addressNumber}` : s.street, s.locality, s.city].filter(Boolean);
  return parts.join(', ') || 'Sin dirección';
};

const ShipmentsListView: React.FC<ShipmentsListViewProps> = ({ clubId, clubName, title, defaultRangeDays }) => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ShipmentStatusValue | 'all'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    if (defaultRangeDays !== null) {
      const today = new Date();
      const past = new Date();
      past.setDate(today.getDate() - defaultRangeDays);
      setFromDate(past.toISOString().slice(0, 10));
      setToDate(today.toISOString().slice(0, 10));
    }
  }, [defaultRangeDays]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/shipments/by-club/${clubId}`);
        setShipments(getResponseData(res) || []);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los envíos.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clubId]);

  const referenceDate = (s: Shipment) => s.actualDeliveryDate || s.estimatedDeliveryStartDate || s.deliveryWindowFrom;

  const filtered = useMemo(() => {
    return shipments
      .filter((s) => statusFilter === 'all' || s.shipmentStatus === statusFilter)
      .filter((s) => {
        const ref = referenceDate(s);
        if (!ref) return !fromDate && !toDate;
        const refTime = new Date(ref).getTime();
        if (fromDate && refTime < new Date(fromDate).getTime()) return false;
        if (toDate && refTime > new Date(toDate).getTime() + 24 * 60 * 60 * 1000) return false;
        return true;
      })
      .sort((a, b) => new Date(referenceDate(b) || 0).getTime() - new Date(referenceDate(a) || 0).getTime());
  }, [shipments, statusFilter, fromDate, toDate]);

  const stats = useMemo(() => ({
    total: filtered.length,
    delivered: filtered.filter((s) => s.shipmentStatus === 'Entregado').length,
    problem: filtered.filter((s) => s.shipmentStatus === 'Problema').length,
    inTransit: filtered.filter((s) => s.shipmentStatus === 'En_Camino' || s.shipmentStatus === 'Asignado').length,
  }), [filtered]);

  const exportToCSV = () => {
    const header = 'ID,Fecha,Cliente,Estado,Courier,Rider,Contenido,Costo\n';
    const rows = filtered.map((s) => {
      const date = referenceDate(s);
      const client = s.user ? `${s.user.firstName} ${s.user.lastName}` : s.idUser;
      const courier = s.courier?.name ?? '';
      const rider = s.rider ? `${s.rider.firstName} ${s.rider.lastName}` : '';
      return `"${s.id}","${date ? new Date(date).toLocaleDateString('es-AR') : ''}","${client}","${s.shipmentStatus}","${courier}","${rider}","${s.boxContent ?? ''}","${s.shippingCost ?? ''}"`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + header + rows.join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `envios_${clubName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="text-center py-16 text-gray-500">Cargando envíos...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">{clubName}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Total</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Entregados</p>
          <p className="text-2xl font-semibold text-emerald-600 mt-1">{stats.delivered}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">En curso</p>
          <p className="text-2xl font-semibold text-indigo-600 mt-1">{stats.inTransit}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-500 uppercase">Con problemas</p>
          <p className="text-2xl font-semibold text-red-600 mt-1">{stats.problem}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        <span className="text-gray-400 text-sm">a</span>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        <button onClick={exportToCSV} className="ml-auto px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
          Exportar a CSV
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Dirección</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contenido</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Courier</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rider</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s) => {
                const date = referenceDate(s);
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">{date ? new Date(date).toLocaleDateString('es-AR') : 'Sin fecha'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{s.user ? `${s.user.firstName} ${s.user.lastName}` : s.idUser}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{formatAddress(s)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{s.boxContent || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(s.shipmentStatus)}`}>{s.shipmentStatus}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{s.courier?.name ?? 'Sin asignar'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{s.rider ? `${s.rider.firstName} ${s.rider.lastName}` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-16 text-gray-500">No hay envíos para los filtros seleccionados.</div>}
      </div>
    </div>
  );
};

export default ShipmentsListView;
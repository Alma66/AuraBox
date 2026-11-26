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
    case 'Asignado': return 'bg-aurora-gold/10 text-aurora-navy border-aurora-gold/30';
    case 'En_Camino': return 'bg-aurora-terracotta/10 text-aurora-terracottaDark border-aurora-terracotta/30';
    case 'Entregado': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Problema': return 'bg-red-50 text-red-700 border-red-200';
    case 'Devuelto': return 'bg-aurora-navy/5 text-aurora-navy/70 border-aurora-navy/15';
    default: return 'bg-aurora-navy/5 text-aurora-navy/70 border-aurora-navy/15';
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

  if (loading) return <div role="status" className="py-16 text-center text-aurora-navy/60">Cargando envíos...</div>;
  if (error) return <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 py-10 text-center text-sm text-red-700">{error}</div>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-3xl font-medium text-aurora-navy">{title}</h2>
        <p className="mt-1 text-sm text-aurora-navy/50">{clubName}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded-3xl bg-white p-5 shadow-aurora-sm ring-1 ring-aurora-navy/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-aurora-navy/50">Total</p>
          <p className="mt-1 font-display text-3xl font-medium text-aurora-navy">{stats.total}</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-aurora-sm ring-1 ring-aurora-navy/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-aurora-navy/50">Entregados</p>
          <p className="mt-1 font-display text-3xl font-medium text-emerald-600">{stats.delivered}</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-aurora-sm ring-1 ring-aurora-navy/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-aurora-navy/50">En curso</p>
          <p className="mt-1 font-display text-3xl font-medium text-aurora-terracotta">{stats.inTransit}</p>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-aurora-sm ring-1 ring-aurora-navy/5">
          <p className="text-xs font-semibold uppercase tracking-wider text-aurora-navy/50">Con problemas</p>
          <p className="mt-1 font-display text-3xl font-medium text-red-600">{stats.problem}</p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-3 shadow-aurora-sm ring-1 ring-aurora-navy/5">
        <select aria-label="Filtrar por estado" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="min-h-[44px] rounded-lg border border-aurora-navy/15 bg-white px-3 text-sm text-aurora-navy focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40">
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input type="date" aria-label="Desde" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="min-h-[44px] rounded-lg border border-aurora-navy/15 bg-white px-3 text-sm text-aurora-navy focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40" />
        <span className="text-aurora-navy/40 text-sm">a</span>
        <input type="date" aria-label="Hasta" value={toDate} onChange={(e) => setToDate(e.target.value)} className="min-h-[44px] rounded-lg border border-aurora-navy/15 bg-white px-3 text-sm text-aurora-navy focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40" />
        <button onClick={exportToCSV} className="ml-auto min-h-[44px] rounded-full bg-aurora-navy px-5 text-sm font-semibold text-white transition-colors hover:bg-aurora-navyLight">
          Exportar a CSV
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-aurora-sm ring-1 ring-aurora-navy/5">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-aurora-navy/10">
            <thead className="bg-aurora-cream">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Dirección</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Contenido</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Courier</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Rider</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aurora-navy/10">
              {filtered.map((s) => {
                const date = referenceDate(s);
                return (
                  <tr key={s.id} className="hover:bg-aurora-cream/60">
                    <td className="px-6 py-4 text-sm text-aurora-navy/80 whitespace-nowrap">{date ? new Date(date).toLocaleDateString('es-AR') : 'Sin fecha'}</td>
                    <td className="px-6 py-4 text-sm text-aurora-navy whitespace-nowrap">{s.user ? `${s.user.firstName} ${s.user.lastName}` : s.idUser}</td>
                    <td className="px-6 py-4 text-sm text-aurora-navy/70 max-w-xs truncate">{formatAddress(s)}</td>
                    <td className="px-6 py-4 text-sm text-aurora-navy/70 max-w-xs truncate">{s.boxContent || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(s.shipmentStatus)}`}>{s.shipmentStatus}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-aurora-navy/70 whitespace-nowrap">{s.courier?.name ?? 'Sin asignar'}</td>
                    <td className="px-6 py-4 text-sm text-aurora-navy/70 whitespace-nowrap">{s.rider ? `${s.rider.firstName} ${s.rider.lastName}` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-16 text-aurora-navy/50">No hay envíos para los filtros seleccionados.</div>}
      </div>
    </div>
  );
};

export default ShipmentsListView;
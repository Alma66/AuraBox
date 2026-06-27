import React, { useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { SalesReportData, PaymentRow } from '../../types/analystics';

interface SalesReportsContentProps {
  activeSection: string;
  data: SalesReportData;
  filters: { from: string; to: string; paymentStatus: string };
  onFilterChange: (k: string, v: string) => void;
  onExportCsv: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const fmt = (n: number | string) =>
  Number(n).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

const SalesReportsContent: React.FC<SalesReportsContentProps> = ({
  activeSection,
  data,
  filters,
  onFilterChange,
  onExportCsv,
}) => {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  if (activeSection === 'resumen') {
    const netRevenue = data.payments.reduce((s, p) => s + Number(p.clubAmount), 0);
    const commissions = data.payments.reduce((s, p) => s + Number(p.commissionAmount ?? 0), 0);
    const exitosos = data.payments.filter((p) => p.paymentStatus === 'Exitoso').length;
    const tasaExito = data.payments.length > 0 ? ((exitosos / data.payments.length) * 100).toFixed(1) : '0.0';

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Resumen de Ventas</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Desde</label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => onFilterChange('from', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Hasta</label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => onFilterChange('to', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Estado de pago</label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => onFilterChange('paymentStatus', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Todos</option>
              <option value="Exitoso">Exitoso</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Rechazado">Rechazado</option>
              <option value="Reembolsado">Reembolsado</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white">
            <p className="text-xs uppercase tracking-wide mb-1 opacity-80">Ingresos totales</p>
            <p className="text-3xl font-bold">{fmt(data.totalRevenue)}</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Pagos exitosos</p>
            <p className="text-3xl font-bold text-gray-900">{data.successfulPaymentsCount}</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Ticket promedio</p>
            <p className="text-3xl font-bold text-gray-900">{fmt(data.avgTicket)}</p>
          </div>
          <div className="border border-green-200 bg-green-50 rounded-xl p-5">
            <p className="text-xs text-green-600 uppercase tracking-wide mb-1">Ingreso neto del club</p>
            <p className="text-3xl font-bold text-green-700">{fmt(netRevenue)}</p>
            <p className="text-xs text-green-500 mt-1">Después de comisiones AuraBox</p>
          </div>
          <div className="border border-orange-200 bg-orange-50 rounded-xl p-5">
            <p className="text-xs text-orange-600 uppercase tracking-wide mb-1">Comisiones AuraBox</p>
            <p className="text-3xl font-bold text-orange-700">{fmt(commissions)}</p>
          </div>
          <div className={`border rounded-xl p-5 ${parseFloat(tasaExito) >= 90 ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tasa de pagos exitosos</p>
            <p className={`text-3xl font-bold ${parseFloat(tasaExito) >= 90 ? 'text-green-700' : 'text-yellow-700'}`}>{tasaExito}%</p>
            <p className="text-xs text-gray-400 mt-1">{exitosos} de {data.payments.length} en este período</p>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'graficos') {
    const acumulado = data.monthlyRevenue.reduce<{ month: string; acumulado: number }[]>((acc, r, i) => {
      const prev = i > 0 ? acc[i - 1].acumulado : 0;
      acc.push({ month: r.month, acumulado: prev + r.current });
      return acc;
    }, []);

    return (
      <div className="space-y-8">
        <h2 className="text-xl font-bold text-gray-900">Gráficos de Ventas</h2>
        <div>
          <h3 className="text-base font-semibold text-gray-700 mb-3">Ingresos por mes (actual vs. anterior)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => fmt(Number(v))} />
              <Legend />
              <Bar dataKey="current" name="Este período" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="previous" name="Período anterior" fill="#93c5fd" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-700 mb-3">Ingresos acumulados del período</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={acumulado}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => fmt(Number(v))} />
              <Area type="monotone" dataKey="acumulado" stroke="#3b82f6" fill="#eff6ff" name="Acumulado" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-base font-semibold text-gray-700 mb-3">Por método de pago</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.byPaymentMethod} dataKey="amount" nameKey="method" cx="50%" cy="50%" outerRadius={80} label={({ method }: { method?: string }) => method ?? ''}>
                  {data.byPaymentMethod.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-700 mb-3">Por tipo de suscripción</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.bySubscriptionType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip formatter={(v) => fmt(Number(v))} />
                <Bar dataKey="amount" fill="#10b981" radius={[0, 4, 4, 0]} name="Ingresos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'pagos') {
    const start = (page - 1) * pageSize;
    const paginated: PaymentRow[] = data.payments.slice(start, start + pageSize);
    const totalPages = Math.ceil(data.totalCount / pageSize);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Detalle de Pagos</h2>
          <button
            onClick={onExportCsv}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar CSV
          </button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Suscripción</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Neto club</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Comisión</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700">
                    {p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('es-AR') : '—'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700">#{p.idUser}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700">#{p.idUserSubscription}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700">{p.idPaymentMethods ?? '—'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-right font-medium text-gray-900">{fmt(p.totalAmountPaid)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-right font-medium text-green-700">{fmt(p.clubAmount)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-right font-medium text-orange-600">{fmt(p.commissionAmount ?? 0)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold
                      ${p.paymentStatus === 'Exitoso' ? 'bg-green-100 text-green-800' : ''}
                      ${p.paymentStatus === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${p.paymentStatus === 'Rechazado' ? 'bg-red-100 text-red-800' : ''}
                      ${p.paymentStatus === 'Reembolsado' ? 'bg-gray-100 text-gray-700' : ''}
                    `}>
                      {p.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-500">No hay pagos con los filtros seleccionados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-gray-500">{data.totalCount} pagos en total</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeSection === 'metodos') {
    const metodos = data.byPaymentMethod;
    const totalMonto = metodos.reduce((s, m) => s + m.amount, 0);
    const totalPagos = data.payments.length;
    const metodosConStats = metodos.map((m) => {
      const pagosDelMetodo = data.payments.filter((p) => String(p.idPaymentMethods ?? '') === m.method);
      return {
        method: m.method,
        amount: m.amount,
        count: pagosDelMetodo.length,
        avgTicket: pagosDelMetodo.length > 0 ? m.amount / pagosDelMetodo.length : 0,
        pctMonto: totalMonto > 0 ? ((m.amount / totalMonto) * 100).toFixed(1) : '0.0',
        pctPagos: totalPagos > 0 ? ((pagosDelMetodo.length / totalPagos) * 100).toFixed(1) : '0.0',
      };
    });
    const masUsado = [...metodosConStats].sort((a, b) => b.count - a.count)[0];
    const masRentable = [...metodosConStats].sort((a, b) => b.amount - a.amount)[0];

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Análisis de Métodos de Pago</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {masUsado && (
            <div className="border border-blue-200 bg-blue-50 rounded-xl p-5">
              <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">Método más usado</p>
              <p className="text-2xl font-bold text-blue-700">{masUsado.method}</p>
              <p className="text-sm text-blue-500 mt-1">{masUsado.count} transacciones ({masUsado.pctPagos}%)</p>
            </div>
          )}
          {masRentable && (
            <div className="border border-green-200 bg-green-50 rounded-xl p-5">
              <p className="text-xs text-green-600 uppercase tracking-wide mb-1">Método más rentable</p>
              <p className="text-2xl font-bold text-green-700">{masRentable.method}</p>
              <p className="text-sm text-green-500 mt-1">{fmt(masRentable.amount)} ({masRentable.pctMonto}% del total)</p>
            </div>
          )}
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Transacciones</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto total</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ticket promedio</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">% del total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {metodosConStats.map((m) => (
                <tr key={m.method} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{m.method}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{m.count}</td>
                  <td className="px-4 py-2 text-right font-medium text-gray-900">{fmt(m.amount)}</td>
                  <td className="px-4 py-2 text-right text-gray-700">{fmt(m.avgTicket)}</td>
                  <td className="px-4 py-2 text-right text-gray-500">{m.pctMonto}%</td>
                </tr>
              ))}
              {metodosConStats.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">No hay datos de métodos de pago.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeSection === 'proyecciones') {
    const monthly = data.monthlyRevenue;
    const last3 = monthly.slice(-3);
    const avgLast3 = last3.length > 0 ? last3.reduce((s, r) => s + r.current, 0) / last3.length : 0;
    const last6 = monthly.slice(-6).map((r, i, arr) => {
      const prev = i > 0 ? arr[i - 1].current : r.current;
      const variacion = prev > 0 ? (((r.current - prev) / prev) * 100).toFixed(1) : '—';
      return { ...r, variacion };
    });

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Proyecciones</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-5 text-white">
            <p className="text-xs uppercase tracking-wide mb-1 opacity-80">Proyección próximo mes</p>
            <p className="text-3xl font-bold">{fmt(avgLast3)}</p>
            <p className="text-xs opacity-70 mt-1">Promedio de los últimos 3 meses</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Basado en meses</p>
            <p className="text-2xl font-bold text-gray-900">{last3.length}</p>
            <p className="text-xs text-gray-400 mt-1">{last3.map((r) => r.month).join(', ')}</p>
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-700 mb-3">Últimos 6 meses con variación</h3>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Variación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {last6.map((r, i) => (
                  <tr key={r.month} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-700">{r.month}</td>
                    <td className="px-4 py-2 text-right font-medium text-gray-900">{fmt(r.current)}</td>
                    <td className={`px-4 py-2 text-right font-medium ${i === 0 ? 'text-gray-400' : Number(r.variacion) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {i === 0 ? '—' : `${Number(r.variacion) >= 0 ? '+' : ''}${r.variacion}%`}
                    </td>
                  </tr>
                ))}
                {last6.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-gray-500">No hay datos suficientes.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SalesReportsContent;
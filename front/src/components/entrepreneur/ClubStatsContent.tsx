import React from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList,
} from 'recharts';
import { ClubStatsData } from '../../types/analystics';

interface ClubStatsContentProps {
  activeSection: string;
  data: ClubStatsData;
  clubId: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const fmt = (n: number | string) =>
  Number(n).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

const ClubStatsContent: React.FC<ClubStatsContentProps> = ({ activeSection, data, clubId }) => {
  if (activeSection === 'resumen') {
    const total = data.activeSubscribers + data.cancelledThisMonth;
    const churnRate = total > 0 ? ((data.cancelledThisMonth / total) * 100).toFixed(1) : '0.0';
    const mrrNum = parseFloat(data.mrr);
    const proyeccionMrr = (mrrNum * (data.retentionRate / 100)).toFixed(0);

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Resumen General</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Suscriptores activos</p>
            <p className="text-3xl font-bold text-gray-900">{data.activeSubscribers}</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nuevos este mes</p>
            <p className="text-3xl font-bold text-green-600">{data.newThisMonth}</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Cancelados este mes</p>
            <p className="text-3xl font-bold text-red-500">{data.cancelledThisMonth}</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tasa de retención</p>
            <p className="text-3xl font-bold text-blue-600">{data.retentionRate}%</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Ticket promedio</p>
            <p className="text-3xl font-bold text-gray-900">{fmt(data.avgTicket)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white">
            <p className="text-xs uppercase tracking-wide mb-1 opacity-80">MRR estimado</p>
            <p className="text-3xl font-bold">{fmt(data.mrr)}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-indigo-200 bg-indigo-50 rounded-xl p-5">
            <p className="text-xs text-indigo-600 uppercase tracking-wide mb-1">Proyección MRR próximo mes</p>
            <p className="text-3xl font-bold text-indigo-700">{fmt(proyeccionMrr)}</p>
            <p className="text-xs text-indigo-500 mt-1">MRR actual × tasa de retención ({data.retentionRate}%)</p>
          </div>
          <div className="border border-orange-200 bg-orange-50 rounded-xl p-5">
            <p className="text-xs text-orange-600 uppercase tracking-wide mb-1">Churn Rate este mes</p>
            <p className="text-3xl font-bold text-orange-700">{churnRate}%</p>
            <p className="text-xs text-orange-500 mt-1">Cancelados / total de suscriptores</p>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'evolucion') {
    const evo = data.subscriberEvolution;
    const best = [...evo].sort((a, b) => b.count - a.count)[0];
    const worst = [...evo].sort((a, b) => a.count - b.count)[0];

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Evolución de Suscriptores</h2>
        <div>
          <h3 className="text-base font-semibold text-gray-700 mb-3">Suscriptores activos por mes (12 meses)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={evo}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Suscriptores" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-green-200 bg-green-50 rounded-xl p-5">
            <p className="text-xs text-green-600 uppercase tracking-wide mb-1">Mejor mes</p>
            <p className="text-2xl font-bold text-green-700">{best?.month ?? '—'}</p>
            <p className="text-sm text-green-600 mt-1">{best?.count ?? 0} suscriptores</p>
          </div>
          <div className="border border-red-200 bg-red-50 rounded-xl p-5">
            <p className="text-xs text-red-600 uppercase tracking-wide mb-1">Mes más bajo</p>
            <p className="text-2xl font-bold text-red-700">{worst?.month ?? '—'}</p>
            <p className="text-sm text-red-600 mt-1">{worst?.count ?? 0} suscriptores</p>
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-700 mb-3">Detalle mes a mes</h3>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Suscriptores</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Variación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {evo.map((row, i) => {
                  const prev = i > 0 ? evo[i - 1].count : row.count;
                  const diff = row.count - prev;
                  return (
                    <tr key={row.month} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-700">{row.month}</td>
                      <td className="px-4 py-2 text-right font-medium text-gray-900">{row.count}</td>
                      <td className={`px-4 py-2 text-right font-medium ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {i === 0 ? '—' : `${diff >= 0 ? '+' : ''}${diff}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'logistica') {
    const breakdown = data.shipmentStatusBreakdown;
    const total = breakdown.reduce((s, r) => s + r.count, 0);
    const entregados = breakdown.find((r) => r.status === 'Entregado')?.count ?? 0;
    const problemas =
      (breakdown.find((r) => r.status === 'Problema')?.count ?? 0) +
      (breakdown.find((r) => r.status === 'Devuelto')?.count ?? 0);
    const tasaExito = total > 0 ? ((entregados / total) * 100).toFixed(1) : '0.0';
    const tasaProblemas = total > 0 ? ((problemas / total) * 100).toFixed(1) : '0.0';
    const exitoNum = parseFloat(tasaExito);
    const semaforoBg = exitoNum >= 90 ? 'bg-green-600' : exitoNum >= 70 ? 'bg-yellow-500' : 'bg-red-600';
    const semaforoLabel = exitoNum >= 90 ? 'Excelente' : exitoNum >= 70 ? 'Aceptable' : 'Requiere atención';

    const renderPieLabel = ({ status, percent }: { status?: string; percent?: number }) =>
      `${status ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`;

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Logística y Envíos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`${semaforoBg} text-white rounded-xl p-5`}>
            <p className="text-xs uppercase tracking-wide mb-1 opacity-80">Tasa de éxito de envíos</p>
            <p className="text-3xl font-bold">{tasaExito}%</p>
            <p className="text-sm mt-1 opacity-90">{semaforoLabel}</p>
          </div>
          <div className="border border-green-200 bg-green-50 rounded-xl p-5">
            <p className="text-xs text-green-600 uppercase tracking-wide mb-1">Entregados</p>
            <p className="text-3xl font-bold text-green-700">{entregados}</p>
            <p className="text-xs text-green-500 mt-1">{tasaExito}% del total</p>
          </div>
          <div className="border border-red-200 bg-red-50 rounded-xl p-5">
            <p className="text-xs text-red-600 uppercase tracking-wide mb-1">Problemas / Devueltos</p>
            <p className="text-3xl font-bold text-red-700">{problemas}</p>
            <p className="text-xs text-red-500 mt-1">{tasaProblemas}% del total</p>
          </div>
        </div>
        {breakdown.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay envíos registrados para este club.</p>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="w-full lg:w-1/2">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={breakdown}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={renderPieLabel}
                  >
                    {breakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full lg:w-1/2 space-y-2">
              {breakdown.map((item, i) => (
                <div key={item.status} className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-sm text-gray-700">{item.status}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                    <span className="text-xs text-gray-400 ml-2">{total > 0 ? ((item.count / total) * 100).toFixed(1) : '0'}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeSection === 'reputacion') {
    const rep = data.reputationSummary;
    const totalRev = rep.totalReviews;
    const positiveApprox = totalRev > 0 ? Math.round(totalRev * ((rep.avgRating - 1) / 4)) : 0;
    const negativeApprox = totalRev > 0 ? Math.round(totalRev * ((5 - rep.avgRating) / 4) * 0.3) : 0;
    const nps = totalRev > 0
      ? (((positiveApprox / totalRev) * 100) - ((negativeApprox / totalRev) * 100)).toFixed(0)
      : '—';
    const ratingBars = [5, 4, 3, 2, 1].map((star) => {
      const weight = star === 5 ? positiveApprox : star === 1 ? negativeApprox : Math.round((totalRev - positiveApprox - negativeApprox) / 3);
      return { star, count: Math.max(0, weight) };
    });

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Reputación</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Rating promedio</p>
            <p className="text-3xl font-bold text-yellow-500">{rep.avgRating} ★</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total reseñas</p>
            <p className="text-3xl font-bold text-gray-900">{rep.totalReviews}</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Con multimedia</p>
            <p className="text-3xl font-bold text-blue-600">{rep.withMediaPercent}%</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reseñas ocultas</p>
            <p className="text-3xl font-bold text-red-500">{rep.hiddenCount}</p>
          </div>
        </div>
        <div className="border border-indigo-200 bg-indigo-50 rounded-xl p-5 inline-block">
          <p className="text-xs text-indigo-600 uppercase tracking-wide mb-1">NPS Estimado</p>
          <p className="text-3xl font-bold text-indigo-700">{nps}</p>
          <p className="text-xs text-indigo-500 mt-1">% ratings 4-5★ menos % ratings 1-2★</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-700 mb-3">Distribución de ratings (estimada)</h3>
          <div className="space-y-2">
            {ratingBars.map((r) => (
              <div key={r.star} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-8 flex-shrink-0">{r.star} ★</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-yellow-400 h-3 rounded-full transition-all"
                    style={{ width: totalRev > 0 ? `${(r.count / totalRev) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="pt-2">
          <Link
            to={`/entrepreneur/club/${clubId}/moderate-reviews`}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Ir a Moderar Reseñas
          </Link>
        </div>
      </div>
    );
  }

  if (activeSection === 'planes') {
    const plans = data.topSubscriptionTypes;
    const totalActivos = plans.reduce((s, p) => s + p.activeCount, 0);

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Planes y Suscripciones</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-base font-semibold text-gray-700 mb-3">Distribución por plan</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={plans} dataKey="activeCount" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                  {plans.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-700 mb-3">Ranking de planes</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={plans} layout="vertical" margin={{ left: 10, right: 40 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={110} />
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <Tooltip />
                <Bar dataKey="activeCount" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Activos">
                  <LabelList dataKey="activeCount" position="right" style={{ fontSize: 11 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-700 mb-3">Tabla de planes</h3>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Activos</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">% del total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {plans.map((plan, i) => (
                  <tr key={plan.name} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-400 font-bold">#{i + 1}</td>
                    <td className="px-4 py-2 font-medium text-gray-900">{plan.name}</td>
                    <td className="px-4 py-2 text-right font-semibold text-blue-600">{plan.activeCount}</td>
                    <td className="px-4 py-2 text-right text-gray-500">
                      {totalActivos > 0 ? ((plan.activeCount / totalActivos) * 100).toFixed(1) : '0.0'}%
                    </td>
                  </tr>
                ))}
                {plans.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-gray-500">No hay planes registrados.</td>
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

export default ClubStatsContent;
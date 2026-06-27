import React from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
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
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-4">Evolución de suscriptores (12 meses)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.subscriberEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Suscriptores" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (activeSection === 'logistica') {
    const renderPieLabel = ({ status, percent }: { status?: string; percent?: number }) =>
      `${status ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`;

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Logística</h2>
        {data.shipmentStatusBreakdown.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay envíos registrados para este club.</p>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="w-full lg:w-1/2">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.shipmentStatusBreakdown}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={renderPieLabel}
                  >
                    {data.shipmentStatusBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full lg:w-1/2 space-y-2">
              {data.shipmentStatusBreakdown.map((item, i) => (
                <div key={item.status} className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-sm text-gray-700">{item.status}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeSection === 'reputacion') {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Reputación</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Rating promedio</p>
            <p className="text-3xl font-bold text-yellow-500">{data.reputationSummary.avgRating} ★</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total reseñas</p>
            <p className="text-3xl font-bold text-gray-900">{data.reputationSummary.totalReviews}</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Con multimedia</p>
            <p className="text-3xl font-bold text-blue-600">{data.reputationSummary.withMediaPercent}%</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reseñas ocultas</p>
            <p className="text-3xl font-bold text-red-500">{data.reputationSummary.hiddenCount}</p>
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

  if (activeSection === 'suscripciones') {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Top Planes de Suscripción</h2>
        {data.topSubscriptionTypes.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay planes registrados.</p>
        ) : (
          <div className="space-y-3">
            {data.topSubscriptionTypes.map((plan, i) => (
              <div key={plan.name} className="flex items-center gap-4 border border-gray-200 rounded-xl px-5 py-4 bg-white">
                <span className="text-2xl font-bold text-gray-300">#{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{plan.name}</p>
                </div>
                <span className="text-sm font-bold text-blue-600">{plan.activeCount} activos</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default ClubStatsContent;
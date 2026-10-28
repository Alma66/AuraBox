import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getResponseData } from '../../api/config';

interface Stats {
  clubs: { total: number; pending: number; approved: number; suspended: number; inactive: number };
  customers: number;
  entrepreneurs: number;
  activeSubscriptions: number;
  reviews: number;
  revenue: { total: number; commission: number };
  monthly: { month: string; total: number; commission: number }[];
  pendingClubs: { id: number; name: string; creationDate: string }[];
}

const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

const monthLabel = (key: string) => {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('es-AR', { month: 'short' });
};

interface KpiProps {
  label: string;
  value: string | number;
  hint?: string;
  highlight?: boolean;
}

const Kpi: React.FC<KpiProps> = ({ label, value, hint, highlight }) => (
  <div
    className={`rounded-2xl border p-5 shadow-aurora-sm ${
      highlight ? 'border-aurora-gold/50 bg-aurora-gold/10' : 'border-aurora-navy/10 bg-white'
    }`}
  >
    <p className="text-xs font-semibold uppercase tracking-wide text-aurora-navy/55">{label}</p>
    <p className="mt-2 font-display text-3xl font-bold text-aurora-navy">{value}</p>
    {hint && <p className="mt-1 text-xs text-aurora-navy/50">{hint}</p>}
  </div>
);

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await api.get('/admin/stats');
      setStats(getResponseData(res));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 px-4 py-6 lg:px-8" aria-busy="true">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-28 rounded-2xl bg-aurora-navy/10" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-aurora-navy/10" />
      </div>
    );
  }

  if (failed || !stats) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p>No se pudieron cargar las estadísticas de la plataforma.</p>
          <button
            type="button"
            onClick={load}
            className="mt-3 min-h-[44px] rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...stats.monthly.map((item) => item.total), 0);

  return (
    <div className="space-y-6 px-4 py-6 lg:px-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          label="Clubes pendientes"
          value={stats.clubs.pending}
          hint="Esperan aprobación"
          highlight={stats.clubs.pending > 0}
        />
        <Kpi label="Clubes activos" value={stats.clubs.approved} hint={`${stats.clubs.total} en total`} />
        <Kpi label="Clientes" value={stats.customers} />
        <Kpi label="Emprendedores" value={stats.entrepreneurs} />
        <Kpi label="Suscripciones activas" value={stats.activeSubscriptions} />
        <Kpi label="Reseñas" value={stats.reviews} />
        <Kpi label="Ingresos procesados" value={money.format(stats.revenue.total)} />
        <Kpi label="Comisión de AuraBox" value={money.format(stats.revenue.commission)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-aurora-navy/10 bg-white p-5 shadow-aurora-sm lg:col-span-2">
          <h2 className="font-display text-lg font-bold text-aurora-navy">Últimos 6 meses</h2>
          <div className="mt-1 flex items-center gap-4 text-xs text-aurora-navy/60">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-aurora-navy" />
              Ingresos
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-aurora-terracotta" />
              Comisión
            </span>
          </div>
          {maxValue > 0 ? (
            <div className="mt-6 flex gap-2">
              {stats.monthly.map((item) => (
                <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-40 w-full items-end justify-center gap-1">
                    <div
                      className="w-1/3 rounded-t bg-aurora-navy"
                      style={{ height: `${(item.total / maxValue) * 100}%` }}
                      title={money.format(item.total)}
                    />
                    <div
                      className="w-1/3 rounded-t bg-aurora-terracotta"
                      style={{ height: `${(item.commission / maxValue) * 100}%` }}
                      title={money.format(item.commission)}
                    />
                  </div>
                  <span className="text-xs capitalize text-aurora-navy/60">{monthLabel(item.month)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-aurora-navy/55">Todavía no hay pagos registrados.</p>
          )}
        </section>

        <section className="rounded-2xl border border-aurora-navy/10 bg-white p-5 shadow-aurora-sm">
          <h2 className="font-display text-lg font-bold text-aurora-navy">Clubes por aprobar</h2>
          {stats.pendingClubs.length === 0 ? (
            <p className="py-10 text-center text-sm text-aurora-navy/55">No hay clubes pendientes.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {stats.pendingClubs.map((club) => (
                <li key={club.id} className="flex items-center justify-between gap-3 rounded-xl bg-aurora-cream px-4 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-aurora-navy">{club.name}</span>
                    <span className="block text-xs text-aurora-navy/50">
                      {new Date(club.creationDate).toLocaleDateString('es-AR')}
                    </span>
                  </span>
                  <Link
                    to="/admin/clubs?status=PENDIENTE_APROBACION"
                    className="flex min-h-[44px] items-center rounded-lg bg-aurora-terracotta px-3 text-xs font-semibold text-white hover:bg-aurora-terracottaDark"
                  >
                    Revisar
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
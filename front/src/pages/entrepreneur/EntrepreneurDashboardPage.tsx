import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getResponseData } from '../../api/config';
import { useAuth } from '../../App';
import Icon from '../../components/entrepreneur/layout/Icon';
import { ENTREPRENEUR_SECTIONS, sectionHref } from '../../config/entrepreneurNav';

interface DashboardData {
  club: any | null;
  subscriptions: any[];
  customers: number | null;
  shipments: any[] | null;
}

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  to?: string;
}

interface AttentionItem {
  key: string;
  text: string;
  to: string;
}

const asArray = (value: any): any[] => (Array.isArray(value) ? value : []);

const formatMoney = (value: number) =>
  value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

const shipmentStatus = (shipment: any): string =>
  String(shipment?.shipmentStatus ?? shipment?.status ?? '');

const MetricCard: React.FC<MetricCardProps> = ({ label, value, hint, to }) => {
  const content = (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-aurora-navy/50">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-aurora-navy">{value}</p>
      {hint && <p className="mt-1 text-xs text-aurora-navy/50">{hint}</p>}
    </>
  );
  const base = 'block rounded-2xl border border-aurora-navy/10 bg-white p-5 shadow-aurora-sm';
  if (to) {
    return (
      <Link to={to} className={`${base} transition-shadow hover:shadow-aurora focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-terracotta`}>
        {content}
      </Link>
    );
  }
  return <div className={base}>{content}</div>;
};

const EntrepreneurDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const clubId = user?.managedClubId ?? '';
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!clubId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        api.get(`/clubs/${clubId}`),
        api.get(`/clubs/${clubId}/user-subscriptions`),
        api.get(`/clubs/${clubId}/customers`),
        api.get(`/clubs/${clubId}/deliveries`),
      ]);
      if (cancelled) return;
      const [clubRes, subsRes, customersRes, shipRes] = results;
      setFailed(results.every((result) => result.status === 'rejected'));
      setData({
        club: clubRes.status === 'fulfilled' ? getResponseData(clubRes.value) : null,
        subscriptions: subsRes.status === 'fulfilled' ? asArray(getResponseData(subsRes.value)) : [],
        customers: customersRes.status === 'fulfilled' ? asArray(getResponseData(customersRes.value)).length : null,
        shipments: shipRes.status === 'fulfilled' ? asArray(getResponseData(shipRes.value)) : null,
      });
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [clubId]);

  const metrics = useMemo(() => {
    const subscriptions = data?.subscriptions ?? [];
    const active = subscriptions.filter((s) => s.subscriptionStatus === 'Activa');
    const pendingPayment = subscriptions.filter((s) => s.subscriptionStatus === 'Pendiente_Pago');
    const monthly = active.reduce((sum, s) => sum + (Number(s.monthlyAmountPaid) || 0), 0);
    const now = Date.now();
    const weekAhead = now + 7 * 24 * 60 * 60 * 1000;
    const upcoming = active.filter((s) => {
      if (!s.nextPaymentDate) return false;
      const time = new Date(s.nextPaymentDate).getTime();
      return time >= now && time <= weekAhead;
    });

    let unassigned: number | null = null;
    if (data?.shipments) {
      const known = data.shipments.filter((s) => shipmentStatus(s));
      unassigned =
        data.shipments.length > 0 && known.length === 0
          ? null
          : known.filter((s) => shipmentStatus(s) === 'Pendiente').length;
    }

    return {
      active: active.length,
      paused: subscriptions.filter((s) => s.subscriptionStatus === 'Pausada').length,
      pendingPayment: pendingPayment.length,
      monthly,
      upcoming: upcoming.length,
      unassigned,
    };
  }, [data]);

  const attention = useMemo<AttentionItem[]>(() => {
    const items: AttentionItem[] = [];
    if (metrics.pendingPayment > 0) {
      items.push({
        key: 'payments',
        text: `${metrics.pendingPayment} suscripción(es) con pago pendiente`,
        to: `/entrepreneur/club/${clubId}/active-subscriptions`,
      });
    }
    if (metrics.unassigned && metrics.unassigned > 0) {
      items.push({
        key: 'shipments',
        text: `${metrics.unassigned} envío(s) sin asignar a un rider`,
        to: `/entrepreneur/club/${clubId}/assign-deliveries`,
      });
    }
    if (metrics.upcoming > 0) {
      items.push({
        key: 'upcoming',
        text: `${metrics.upcoming} cobro(s) programados en los próximos 7 días`,
        to: `/entrepreneur/club/${clubId}/active-subscriptions`,
      });
    }
    return items;
  }, [metrics, clubId]);

  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
  const rating = data?.club?.averageRating ? Number(data.club.averageRating).toFixed(1) : '—';
  const reviews = data?.club?.totalReviews ?? 0;

  if (!clubId) {
    return (
      <div className="px-4 py-8 lg:px-8">
        <p className="text-sm text-aurora-navy/60">No hay un club asociado a tu cuenta.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 px-4 py-6 lg:px-8">
        <div className="h-8 w-64 rounded bg-aurora-navy/10" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-28 rounded-2xl bg-aurora-navy/10" />
          ))}
        </div>
        <div className="h-40 rounded-2xl bg-aurora-navy/10" />
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 py-6 lg:px-8">
      <div>
        <p className="text-sm capitalize text-aurora-navy/50">{today}</p>
        <h1 className="font-display text-2xl font-bold text-aurora-navy md:text-3xl">
          Hola, {user?.firstName || 'emprendedor'}
        </h1>
        {data?.club?.name && <p className="text-sm text-aurora-navy/60">Así viene {data.club.name} hoy.</p>}
      </div>

      {failed && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          No pudimos cargar los datos del club. Probá recargar la página.
        </div>
      )}

      <section aria-label="Métricas principales" className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          label="Suscripciones activas"
          value={String(metrics.active)}
          hint={metrics.paused > 0 ? `${metrics.paused} pausada(s)` : undefined}
          to={`/entrepreneur/club/${clubId}/active-subscriptions`}
        />
        <MetricCard
          label="Ingreso mensual"
          value={formatMoney(metrics.monthly)}
          hint="Estimado sobre suscripciones activas"
        />
        <MetricCard
          label="Clientes"
          value={data?.customers === null || data?.customers === undefined ? '—' : String(data.customers)}
          to={`/entrepreneur/club/${clubId}/manage-customers`}
        />
        <MetricCard
          label="Valoración"
          value={rating}
          hint={`${reviews} reseña(s)`}
          to={`/entrepreneur/club/${clubId}/moderate-reviews`}
        />
        <MetricCard
          label="Pagos pendientes"
          value={String(metrics.pendingPayment)}
          to={`/entrepreneur/club/${clubId}/active-subscriptions`}
        />
        <MetricCard
          label="Envíos sin asignar"
          value={metrics.unassigned === null ? '—' : String(metrics.unassigned)}
          to={`/entrepreneur/club/${clubId}/assign-deliveries`}
        />
      </section>

      <section aria-label="Requiere tu atención">
        <h2 className="mb-3 font-display text-lg font-bold text-aurora-navy">Requiere tu atención</h2>
        {attention.length === 0 ? (
          <div className="rounded-2xl border border-aurora-navy/10 bg-white p-5 text-sm text-aurora-navy/60">
            Todo al día. No hay pendientes urgentes.
          </div>
        ) : (
          <ul className="divide-y divide-aurora-navy/10 overflow-hidden rounded-2xl border border-aurora-navy/10 bg-white">
            {attention.map((item) => (
              <li key={item.key}>
                <Link
                  to={item.to}
                  className="flex min-h-[52px] items-center justify-between gap-3 px-5 text-sm font-semibold text-aurora-navy hover:bg-aurora-cream"
                >
                  <span>{item.text}</span>
                  <Icon name="arrow" className="h-4 w-4 flex-shrink-0 text-aurora-terracotta" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Accesos rápidos">
        <h2 className="mb-3 font-display text-lg font-bold text-aurora-navy">Accesos rápidos</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ENTREPRENEUR_SECTIONS.filter((section) => section.id !== 'dashboard').map((section) => (
            <Link
              key={section.id}
              to={sectionHref(section, clubId)}
              className="flex items-start gap-4 rounded-2xl border border-aurora-navy/10 bg-white p-4 transition-shadow hover:shadow-aurora focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-terracotta"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-aurora-navy text-aurora-cream">
                <Icon name={section.icon} className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-aurora-navy">{section.label}</span>
                <span className="block truncate text-xs text-aurora-navy/50">
                  {section.tabs.map((tab) => tab.label).join(' · ')}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default EntrepreneurDashboardPage;

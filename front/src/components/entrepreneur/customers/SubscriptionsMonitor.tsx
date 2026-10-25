import React, { useMemo, useState } from 'react';
import { Subscription, NormalizedStatus, normalizeStatus } from '../../../types/subscription';
import { User } from '../../../types/user';
import { SubscriptionPlan } from '../../../types/club';
import Icon from '../layout/Icon';
import { STATUS_LABEL, STATUS_COLOR, formatDate, formatMoney, initialOf } from './customerUtils';

type SortField = 'customer' | 'plan' | 'status' | 'startDate' | 'nextPayment';

interface SubscriptionsMonitorProps {
  subscriptions: Subscription[];
  customers: User[];
  plans: SubscriptionPlan[];
  onOpen: (sub: Subscription) => void;
}

interface Row {
  sub: Subscription;
  customer: User | undefined;
  plan: SubscriptionPlan | undefined;
  status: NormalizedStatus;
  name: string;
  overdue: boolean;
}

const controlClass =
  'min-h-[44px] rounded-lg border border-aurora-navy/15 bg-white px-3 text-sm text-aurora-navy focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40';

const sortValue = (row: Row, field: SortField): string => {
  switch (field) {
    case 'customer':
      return row.name.toLowerCase();
    case 'plan':
      return (row.plan?.name ?? '').toLowerCase();
    case 'status':
      return row.status;
    case 'startDate':
      return row.sub.startDate ?? '';
    default:
      return row.sub.nextPaymentDate ?? '';
  }
};

const SubscriptionsMonitor: React.FC<SubscriptionsMonitorProps> = ({ subscriptions, customers, plans, onOpen }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | NormalizedStatus>('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('startDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const customerMap = useMemo(() => new Map(customers.map((c) => [String(c.id), c])), [customers]);
  const planMap = useMemo(() => new Map(plans.map((p) => [Number(p.planId), p])), [plans]);

  const enriched = useMemo<Row[]>(
    () =>
      subscriptions.map((sub) => {
        const customer = customerMap.get(String(sub.idUser));
        const plan = planMap.get(sub.idSubscriptionTypes);
        const status = normalizeStatus(sub.subscriptionStatus);
        const name = customer ? `${customer.firstName} ${customer.lastName}` : `Usuario #${sub.idUser}`;
        const overdue =
          !!sub.nextPaymentDate &&
          new Date(sub.nextPaymentDate).getTime() < Date.now() &&
          status !== 'cancelled' &&
          status !== 'finished';
        return { sub, customer, plan, status, name, overdue };
      }),
    [subscriptions, customerMap, planMap],
  );

  const counts = useMemo(() => {
    const byStatus = (status: NormalizedStatus) => enriched.filter((row) => row.status === status).length;
    const revenue = enriched
      .filter((row) => row.status === 'active')
      .reduce((sum, row) => sum + (row.plan?.price ?? 0), 0);
    return {
      active: byStatus('active'),
      paused: byStatus('paused'),
      pending: byStatus('pending'),
      cancelled: byStatus('cancelled'),
      revenue,
    };
  }, [enriched]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return enriched
      .filter((row) => {
        const matchSearch =
          !term ||
          row.name.toLowerCase().includes(term) ||
          (row.customer?.email ?? '').toLowerCase().includes(term) ||
          (row.plan?.name ?? '').toLowerCase().includes(term);
        const matchStatus = statusFilter === 'all' || row.status === statusFilter;
        const matchPlan = planFilter === 'all' || row.sub.idSubscriptionTypes === Number(planFilter);
        return matchSearch && matchStatus && matchPlan;
      })
      .sort((a, b) => {
        const result = sortValue(a, sortField).localeCompare(sortValue(b, sortField));
        return sortDir === 'asc' ? result : -result;
      });
  }, [enriched, search, statusFilter, planFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const hasFilters = search !== '' || statusFilter !== 'all' || planFilter !== 'all';

  const kpis: { label: string; value: string | number; filter: NormalizedStatus | null; accent: string }[] = [
    { label: 'Activas', value: counts.active, filter: 'active', accent: 'border-green-500' },
    { label: 'Pausadas', value: counts.paused, filter: 'paused', accent: 'border-yellow-500' },
    { label: 'Pago pendiente', value: counts.pending, filter: 'pending', accent: 'border-orange-500' },
    { label: 'Canceladas', value: counts.cancelled, filter: 'cancelled', accent: 'border-red-400' },
    { label: 'Ingreso mensual est.', value: formatMoney(counts.revenue), filter: null, accent: 'border-aurora-navy' },
  ];

  const headerButton = (field: SortField, label: string) => (
    <button
      type="button"
      onClick={() => toggleSort(field)}
      className="flex min-h-[44px] items-center gap-1 text-xs font-semibold uppercase tracking-wide text-aurora-navy/55 hover:text-aurora-navy"
    >
      {label}
      <span aria-hidden="true" className="text-aurora-navy/30">
        {sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    </button>
  );

  const ariaSort = (field: SortField): 'ascending' | 'descending' | 'none' =>
    sortField === field ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none';

  return (
    <div className="space-y-5">
      <section aria-label="Resumen de suscripciones" className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {kpis.map((kpi) => {
          const selected = kpi.filter !== null && statusFilter === kpi.filter;
          const content = (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-aurora-navy/50">{kpi.label}</p>
              <p className="mt-1 font-display text-2xl font-bold text-aurora-navy">{kpi.value}</p>
            </>
          );
          const base = `rounded-xl border-l-4 bg-white px-4 py-3 text-left shadow-aurora-sm ${kpi.accent}`;
          if (kpi.filter === null) {
            return (
              <div key={kpi.label} className={base}>
                {content}
              </div>
            );
          }
          const filter = kpi.filter;
          return (
            <button
              key={kpi.label}
              type="button"
              aria-pressed={selected}
              onClick={() => setStatusFilter(selected ? 'all' : filter)}
              className={`${base} min-h-[44px] transition-shadow hover:shadow-aurora focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-terracotta ${
                selected ? 'bg-aurora-cream' : ''
              }`}
            >
              {content}
            </button>
          );
        })}
      </section>

      <div className="flex flex-col gap-3 rounded-xl border border-aurora-navy/10 bg-white p-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aurora-navy/35" />
          <label htmlFor="subs-search" className="sr-only">
            Buscar suscripciones
          </label>
          <input
            id="subs-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o plan..."
            className={`${controlClass} w-full pl-9`}
          />
        </div>
        <label htmlFor="subs-status" className="sr-only">
          Estado
        </label>
        <select
          id="subs-status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | NormalizedStatus)}
          className={controlClass}
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="paused">Pausadas</option>
          <option value="cancelled">Canceladas</option>
          <option value="pending">Pago pendiente</option>
          <option value="finished">Finalizadas</option>
        </select>
        <label htmlFor="subs-plan" className="sr-only">
          Plan
        </label>
        <select id="subs-plan" value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className={controlClass}>
          <option value="all">Todos los planes</option>
          {plans.map((plan) => (
            <option key={plan.planId} value={plan.planId}>
              {plan.name}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setStatusFilter('all');
              setPlanFilter('all');
            }}
            className="min-h-[44px] whitespace-nowrap rounded-lg border border-red-200 px-3 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Limpiar filtros
          </button>
        )}
        <span className="whitespace-nowrap text-sm text-aurora-navy/55" aria-live="polite">
          {rows.length} resultado{rows.length !== 1 ? 's' : ''}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-aurora-navy/10 bg-white px-6 py-16 text-center text-sm text-aurora-navy/55">
          No se encontraron suscripciones con los filtros aplicados.
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-aurora-navy/10 bg-white shadow-aurora-sm md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-aurora-navy/10">
                <thead className="bg-aurora-cream">
                  <tr>
                    <th scope="col" aria-sort={ariaSort('customer')} className="px-4 text-left">
                      {headerButton('customer', 'Cliente')}
                    </th>
                    <th scope="col" aria-sort={ariaSort('plan')} className="px-4 text-left">
                      {headerButton('plan', 'Plan')}
                    </th>
                    <th scope="col" aria-sort={ariaSort('status')} className="px-4 text-left">
                      {headerButton('status', 'Estado')}
                    </th>
                    <th scope="col" aria-sort={ariaSort('startDate')} className="px-4 text-left">
                      {headerButton('startDate', 'Inicio')}
                    </th>
                    <th scope="col" aria-sort={ariaSort('nextPayment')} className="px-4 text-left">
                      {headerButton('nextPayment', 'Próximo pago')}
                    </th>
                    <th scope="col" className="px-4 text-left text-xs font-semibold uppercase tracking-wide text-aurora-navy/55">
                      Monto
                    </th>
                    <th scope="col" className="px-4">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aurora-navy/5">
                  {rows.map((row) => (
                    <tr
                      key={row.sub.id}
                      onClick={() => onOpen(row.sub)}
                      className={`cursor-pointer transition-colors hover:bg-aurora-cream/60 ${row.overdue ? 'border-l-2 border-l-red-400' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-aurora-navy/10 text-sm font-bold text-aurora-navy">
                            {initialOf(row.customer?.firstName)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-aurora-navy">{row.name}</p>
                            <p className="truncate text-xs text-aurora-navy/45">{row.customer?.email ?? ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-aurora-navy/80">
                          {row.plan?.name ?? `Plan #${row.sub.idSubscriptionTypes}`}
                        </p>
                        <p className="text-xs text-aurora-navy/45">{row.plan?.deliveryFrequency ?? ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[row.status]}`}>
                          {STATUS_LABEL[row.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-aurora-navy/70">{formatDate(row.sub.startDate)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={row.overdue ? 'font-semibold text-red-600' : 'text-aurora-navy/70'}>
                          {formatDate(row.sub.nextPaymentDate)}
                        </span>
                        {row.overdue && (
                          <span className="ml-1 rounded-full bg-red-100 px-1.5 py-0.5 text-xs text-red-600">Vencido</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-aurora-navy">
                        {row.plan ? formatMoney(row.plan.price) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpen(row.sub);
                          }}
                          className="min-h-[44px] rounded-lg border border-aurora-navy/20 px-3 text-xs font-semibold text-aurora-navy hover:bg-aurora-cream"
                        >
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ul className="space-y-3 md:hidden">
            {rows.map((row) => (
              <li key={row.sub.id}>
                <button
                  type="button"
                  onClick={() => onOpen(row.sub)}
                  className={`w-full rounded-xl border bg-white p-4 text-left shadow-aurora-sm ${
                    row.overdue ? 'border-red-300' : 'border-aurora-navy/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-aurora-navy">{row.name}</p>
                      <p className="truncate text-xs text-aurora-navy/50">
                        {row.plan?.name ?? `Plan #${row.sub.idSubscriptionTypes}`}
                      </p>
                    </div>
                    <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[row.status]}`}>
                      {STATUS_LABEL[row.status]}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-aurora-navy/60">
                    <span className={row.overdue ? 'font-semibold text-red-600' : ''}>
                      Próximo pago: {formatDate(row.sub.nextPaymentDate)}
                      {row.overdue ? ' (vencido)' : ''}
                    </span>
                    <span className="font-semibold text-aurora-navy">{row.plan ? formatMoney(row.plan.price) : '—'}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default SubscriptionsMonitor;
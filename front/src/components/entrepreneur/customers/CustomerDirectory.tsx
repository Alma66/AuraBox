import React, { useMemo, useState } from 'react';
import { Subscription, normalizeStatus } from '../../../types/subscription';
import { User } from '../../../types/user';
import Icon from '../layout/Icon';
import { initialOf } from './customerUtils';

interface CustomerDirectoryProps {
  customers: User[];
  subscriptions: Subscription[];
  onOpen: (customer: User) => void;
}

const CustomerDirectory: React.FC<CustomerDirectoryProps> = ({ customers, subscriptions, onOpen }) => {
  const [search, setSearch] = useState('');

  const counts = useMemo(() => {
    const map = new Map<string, { total: number; active: number }>();
    subscriptions.forEach((sub) => {
      const key = String(sub.idUser);
      const current = map.get(key) ?? { total: 0, active: 0 };
      current.total += 1;
      if (normalizeStatus(sub.subscriptionStatus) === 'active') current.active += 1;
      map.set(key, current);
    });
    return map;
  }, [subscriptions]);

  const list = useMemo(() => {
    const term = search.trim().toLowerCase();
    return customers
      .filter((c) => {
        if (!term) return true;
        return (
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(term) ||
          (c.email ?? '').toLowerCase().includes(term) ||
          (c.city ?? '').toLowerCase().includes(term)
        );
      })
      .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
  }, [customers, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 rounded-xl border border-aurora-navy/10 bg-white p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aurora-navy/35" />
          <label htmlFor="customers-search" className="sr-only">
            Buscar clientes
          </label>
          <input
            id="customers-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o ciudad..."
            className="min-h-[44px] w-full rounded-lg border border-aurora-navy/15 bg-white pl-9 pr-3 text-sm text-aurora-navy focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40"
          />
        </div>
        <span className="text-sm text-aurora-navy/55" aria-live="polite">
          {list.length} cliente{list.length !== 1 ? 's' : ''}
        </span>
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-aurora-navy/10 bg-white px-6 py-16 text-center text-sm text-aurora-navy/55">
          {customers.length === 0 ? 'Todavía no tenés clientes suscriptos.' : 'Sin resultados para esa búsqueda.'}
        </div>
      ) : (
        <ul className="divide-y divide-aurora-navy/10 overflow-hidden rounded-xl border border-aurora-navy/10 bg-white shadow-aurora-sm">
          {list.map((customer) => {
            const stat = counts.get(String(customer.id)) ?? { total: 0, active: 0 };
            const place = [customer.city, customer.province].filter(Boolean).join(', ');
            return (
              <li key={customer.id}>
                <button
                  type="button"
                  onClick={() => onOpen(customer)}
                  className="flex min-h-[64px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-aurora-cream/60 focus:outline-none focus-visible:bg-aurora-cream"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-aurora-navy/10 text-sm font-bold text-aurora-navy">
                    {initialOf(customer.firstName)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-aurora-navy">
                      {customer.firstName} {customer.lastName}
                    </span>
                    <span className="block truncate text-xs text-aurora-navy/50">{customer.email}</span>
                  </span>
                  {place && <span className="hidden truncate text-xs text-aurora-navy/50 md:block md:max-w-[200px]">{place}</span>}
                  <span className="flex flex-shrink-0 items-center gap-2">
                    {stat.active > 0 && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        {stat.active} activa{stat.active !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span className="hidden rounded-full bg-aurora-navy/10 px-2 py-0.5 text-xs font-semibold text-aurora-navy sm:inline">
                      {stat.total} en total
                    </span>
                    <Icon name="chevronRight" className="h-4 w-4 text-aurora-navy/35" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CustomerDirectory;
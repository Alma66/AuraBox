import React, { useCallback, useEffect, useState } from 'react';
import api, { getResponseData } from '../../../api/config';
import Icon from '../layout/Icon';

interface PlanSummary {
  id: number;
  name: string;
  description?: string | null;
  active: boolean;
  frequency: string;
  createdAt?: string;
}

interface BoxesOverviewProps {
  clubId: string;
  onSelect: (planId: number) => void;
}

const BoxesOverview: React.FC<BoxesOverviewProps> = ({ clubId, onSelect }) => {
  const [items, setItems] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get(`/subscription-types?clubId=${clubId}`);
      setItems(getResponseData(res) || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3 px-4 py-6 lg:px-8" aria-busy="true">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-20 rounded-2xl bg-aurora-navy/10" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p>No se pudieron cargar los planes del club.</p>
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

  return (
    <div className="space-y-4 px-4 py-6 lg:px-8">
      <p className="text-sm text-aurora-navy/60">
        Elegí un plan para ver el historial de cajas mensuales y cargar el contenido del próximo envío.
      </p>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-aurora-navy/10 bg-white px-6 py-16 text-center text-sm text-aurora-navy/55">
          Todavía no creaste ningún plan. Creá el primero en la pestaña Planes.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className="flex min-h-[72px] w-full items-center justify-between gap-4 rounded-2xl border border-aurora-navy/10 bg-white p-4 text-left shadow-aurora-sm transition-shadow hover:shadow-aurora focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-terracotta"
              >
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-semibold text-aurora-navy">{item.name}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        item.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.active ? 'Habilitada' : 'Deshabilitada'}
                    </span>
                  </span>
                  <span className="mt-1 block text-xs text-aurora-navy/50">{item.frequency}</span>
                  {item.description && (
                    <span className="mt-1 line-clamp-1 block text-sm text-aurora-navy/60">{item.description}</span>
                  )}
                </span>
                <Icon name="chevronRight" className="h-5 w-5 flex-shrink-0 text-aurora-navy/35" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BoxesOverview;
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  timeAgo,
} from '../utils/notifications';

const TYPE_STYLES: Record<string, { label: string; chip: string }> = {
  renewal: { label: 'Renovación', chip: 'bg-aurora-gold/30 text-aurora-navyDark' },
  shipment: { label: 'Envío', chip: 'bg-aurora-navy/10 text-aurora-navy' },
};

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setItems(await fetchNotifications());
      setError('');
    } catch {
      setError('No pudimos cargar tus notificaciones. Probá de nuevo en un momento.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unread = items.filter((item) => !item.readAt).length;

  const openItem = async (item: AppNotification) => {
    if (!item.readAt) {
      setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, readAt: new Date().toISOString() } : entry)));
      markNotificationRead(item.id).catch(() => undefined);
    }
    if (item.link && item.link.startsWith('/')) navigate(item.link);
  };

  const readAll = async () => {
    const now = new Date().toISOString();
    setItems((prev) => prev.map((entry) => (entry.readAt ? entry : { ...entry, readAt: now })));
    try {
      await markAllNotificationsRead();
    } catch {
      load();
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-aurora-navy sm:text-3xl">Notificaciones</h1>
          <p className="mt-1 text-sm text-aurora-navy/70">
            {unread > 0 ? `Tenés ${unread} sin leer` : 'Estás al día'}
          </p>
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={readAll}
            className="rounded-full border border-aurora-navy/20 px-4 py-2 text-sm font-semibold text-aurora-navy transition-colors hover:bg-white"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {loading && (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((key) => (
            <div key={key} className="h-20 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="font-display text-lg font-bold text-aurora-navy">Todavía no tenés notificaciones</p>
          <p className="mt-1 text-sm text-aurora-navy/70">
            Te avisamos cuando se acerque la renovación de tus suscripciones y cuando tu caja cambie de estado.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <ul className="space-y-3">
          {items.map((item) => {
            const style = TYPE_STYLES[item.type] ?? { label: 'Aviso', chip: 'bg-aurora-navy/10 text-aurora-navy' };
            const isUnread = !item.readAt;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => openItem(item)}
                  className={`flex w-full items-start gap-3 rounded-2xl p-4 text-left shadow-sm transition-colors ${
                    isUnread ? 'bg-white ring-1 ring-aurora-terracotta/40' : 'bg-white/70'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${isUnread ? 'bg-aurora-terracotta' : 'bg-transparent'}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${style.chip}`}>{style.label}</span>
                      <span className="text-xs text-aurora-navy/60">{timeAgo(item.createdAt)}</span>
                    </span>
                    <span className={`mt-1 block text-aurora-navy ${isUnread ? 'font-bold' : 'font-semibold'}`}>{item.title}</span>
                    <span className="mt-0.5 block text-sm text-aurora-navy/75">{item.message}</span>
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

export default NotificationsPage;
import { LocalNotifications } from '@capacitor/local-notifications';
import { fetchUpcomingRenewals, UpcomingRenewal } from './notifications';
import { isNativeApp } from './native';

const CHANNEL_ID = 'renewals';
const DAY_MS = 24 * 60 * 60 * 1000;
const REMIND_DAYS = [3, 1];
const REMIND_HOUR = 10;
const ID_BASE = 7000000;

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });

const formatAmount = (value: number) =>
  Number.isFinite(value)
    ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value)
    : '';

const reminderTime = (dueIso: string, daysBefore: number): Date => {
  const base = new Date(new Date(dueIso).getTime() - daysBefore * DAY_MS);
  base.setHours(REMIND_HOUR, 0, 0, 0);
  return base;
};

const buildSchedule = (renewals: UpcomingRenewal[]) => {
  const now = Date.now();
  const items: Array<{
    id: number;
    title: string;
    body: string;
    schedule: { at: Date; allowWhileIdle: boolean };
    channelId: string;
    smallIcon: string;
    extra: { route: string };
  }> = [];

  renewals.forEach((renewal) => {
    REMIND_DAYS.forEach((daysBefore, index) => {
      const at = reminderTime(renewal.dueDate, daysBefore);
      if (at.getTime() <= now) return;
      const when = daysBefore === 1 ? 'mañana' : `en ${daysBefore} días`;
      const amount = renewal.paymentMethod === 'efectivo' ? '' : formatAmount(renewal.amount);
      items.push({
        id: ID_BASE + renewal.subscriptionId * 10 + index,
        title: `Tu suscripción se renueva ${when}`,
        body: `${renewal.planName} · ${formatDay(renewal.dueDate)}${amount ? ` · ${amount}` : ''}`,
        schedule: { at, allowWhileIdle: true },
        channelId: CHANNEL_ID,
        smallIcon: 'ic_stat_aurabox',
        extra: { route: '/customer/subscriptions' },
      });
    });
  });

  return items;
};

const ensurePermission = async (): Promise<boolean> => {
  const current = await LocalNotifications.checkPermissions();
  if (current.display === 'granted') return true;
  if (current.display === 'denied') return false;
  const requested = await LocalNotifications.requestPermissions();
  return requested.display === 'granted';
};

export const clearLocalReminders = async (): Promise<void> => {
  if (!isNativeApp()) return;
  try {
    const pending = await LocalNotifications.getPending();
    const ours = pending.notifications.filter((item) => item.id >= ID_BASE);
    if (ours.length > 0) await LocalNotifications.cancel({ notifications: ours.map((item) => ({ id: item.id })) });
  } catch {
    return;
  }
};

export const syncLocalReminders = async (): Promise<void> => {
  if (!isNativeApp()) return;
  try {
    if (!(await ensurePermission())) return;
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: 'Renovaciones de suscripción',
      description: 'Avisos antes de que se renueve tu suscripción',
      importance: 4,
      visibility: 1,
    });
    const renewals = await fetchUpcomingRenewals();
    await clearLocalReminders();
    const items = buildSchedule(renewals);
    if (items.length > 0) await LocalNotifications.schedule({ notifications: items });
  } catch {
    return;
  }
};

export const listenForReminderTaps = (navigate: (route: string) => void): (() => void) => {
  if (!isNativeApp()) return () => undefined;
  let removed = false;
  let remove: (() => void) | null = null;
  LocalNotifications.addListener('localNotificationActionPerformed', (event) => {
    const route = (event.notification.extra as { route?: string } | undefined)?.route;
    if (route && route.startsWith('/')) navigate(route);
  })
    .then((handle) => {
      if (removed) handle.remove();
      else
        remove = () => {
          handle.remove();
        };
    })
    .catch(() => undefined);
  return () => {
    removed = true;
    if (remove) remove();
  };
};
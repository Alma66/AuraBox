import api, { getResponseData } from '../api/config';

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface UpcomingRenewal {
  subscriptionId: number;
  planName: string;
  dueDate: string;
  amount: number;
  paymentMethod: string | null;
}

const EVENT_NAME = 'aurabox:notifications-changed';

export const notifyNotificationsChanged = (): void => {
  window.dispatchEvent(new Event(EVENT_NAME));
};

export const onNotificationsChanged = (listener: () => void): (() => void) => {
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
};

export const fetchNotifications = async (): Promise<AppNotification[]> => {
  const response = await api.get('/notifications');
  const data = getResponseData(response) as AppNotification[] | undefined;
  return Array.isArray(data) ? data : [];
};

export const fetchUnreadCount = async (): Promise<number> => {
  const response = await api.get('/notifications/unread-count');
  const data = getResponseData(response) as { count?: number } | undefined;
  return typeof data?.count === 'number' ? data.count : 0;
};

export const fetchUpcomingRenewals = async (): Promise<UpcomingRenewal[]> => {
  const response = await api.get('/notifications/upcoming-renewals');
  const data = getResponseData(response) as UpcomingRenewal[] | undefined;
  return Array.isArray(data) ? data : [];
};

export const markNotificationRead = async (id: number): Promise<void> => {
  await api.patch(`/notifications/${id}/read`);
  notifyNotificationsChanged();
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await api.patch('/notifications/read-all');
  notifyNotificationsChanged();
};

export const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff) || diff < 0) return 'Ahora';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
};
import { NormalizedStatus, SubscriptionStatus } from '../../../types/subscription';

export const STATUS_LABEL: Record<NormalizedStatus, string> = {
  active: 'Activa',
  paused: 'Pausada',
  cancelled: 'Cancelada',
  pending: 'Pago pendiente',
  finished: 'Finalizada',
};

export const STATUS_COLOR: Record<NormalizedStatus, string> = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  pending: 'bg-orange-100 text-orange-800',
  finished: 'bg-aurora-navy/10 text-aurora-navy/70',
};

export const STATUS_DOT: Record<NormalizedStatus, string> = {
  active: 'bg-green-500',
  paused: 'bg-yellow-400',
  cancelled: 'bg-red-400',
  pending: 'bg-orange-400',
  finished: 'bg-aurora-navy/40',
};

export interface StatusAction {
  status: SubscriptionStatus;
  label: string;
  tone: string;
  needsConfirm: boolean;
}

export const STATUS_ACTIONS: StatusAction[] = [
  { status: 'Activa', label: 'Activar', tone: 'border-green-300 text-green-700 hover:bg-green-50', needsConfirm: false },
  { status: 'Pausada', label: 'Pausar', tone: 'border-yellow-300 text-yellow-700 hover:bg-yellow-50', needsConfirm: false },
  { status: 'Pendiente_Pago', label: 'Pago pendiente', tone: 'border-orange-300 text-orange-700 hover:bg-orange-50', needsConfirm: false },
  { status: 'Cancelada', label: 'Cancelar', tone: 'border-red-300 text-red-700 hover:bg-red-50', needsConfirm: true },
  { status: 'Finalizada', label: 'Finalizar', tone: 'border-aurora-navy/20 text-aurora-navy/70 hover:bg-aurora-cream', needsConfirm: true },
];

export const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('es-AR') : '—';

export const formatMoney = (value: number) => `$${value.toLocaleString('es-AR')}`;

export const initialOf = (firstName?: string | null) => (firstName?.[0] ?? '?').toUpperCase();

export const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const getErrorMessage = (err: any, fallback: string) => {
  const msg = err?.response?.data?.message;
  return Array.isArray(msg) ? msg.join(', ') : msg || fallback;
};
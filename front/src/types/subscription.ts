export type SubscriptionStatus = 'Activa' | 'Pendiente_Pago' | 'Cancelada' | 'Pausada' | 'Finalizada';

export type NormalizedStatus = 'active' | 'pending' | 'cancelled' | 'paused' | 'finished';

export function normalizeStatus(status: SubscriptionStatus): NormalizedStatus {
  switch (status) {
    case 'Activa': return 'active';
    case 'Pausada': return 'paused';
    case 'Cancelada': return 'cancelled';
    case 'Pendiente_Pago': return 'pending';
    case 'Finalizada': return 'finished';
    default: return 'active';
  }
}

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  Activa: 'Activa',
  Pendiente_Pago: 'Pago Pendiente',
  Cancelada: 'Cancelada',
  Pausada: 'Pausada',
  Finalizada: 'Finalizada',
};

export interface Subscription {
  id: number;
  idUser: number;
  idSubscriptionTypes: number;
  idPaymentMethods?: number | null;
  startDate: string;
  expectedEndDate?: string | null;
  subscriptionStatus: SubscriptionStatus;
  lastPaymentDate?: string | null;
  nextPaymentDate?: string | null;
  monthlyAmountPaid?: string | null;
  cancellationReason?: string | null;
  cancellationDate?: string | null;
}
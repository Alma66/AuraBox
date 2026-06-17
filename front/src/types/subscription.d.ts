export type SubscriptionStatus = 'ACTIVA' | 'CANCELADA' | 'PAUSADA' | 'PENDIENTE_PAGO' | 'FINALIZADA';

export type NormalizedStatus = 'active' | 'paused' | 'cancelled' | 'pending' | 'finished';

export function normalizeStatus(status: SubscriptionStatus): NormalizedStatus {
  switch (status) {
    case 'ACTIVA': return 'active';
    case 'PAUSADA': return 'paused';
    case 'CANCELADA': return 'cancelled';
    case 'PENDIENTE_PAGO': return 'pending';
    case 'FINALIZADA': return 'finished';
    default: return 'active';
  }
}

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
import { PaymentMethodCode } from '../../modules/payments/payments.constants';

const FREQUENCY_MONTHS: Record<string, number> = {
  Mensual: 1,
  Bimestral: 2,
  Trimestral: 3,
  Cuatrimestral: 4,
  Quinquemestral: 5,
  Semestral: 6,
  Anual: 12,
};

export const addMonths = (from: Date, months: number) => {
  const result = new Date(from);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
};

export const nextPaymentFrom = (from: Date, frequency: string): Date | null => {
  const months = FREQUENCY_MONTHS[frequency];
  return months ? addMonths(from, months) : null;
};

export const nextFutureDate = (from: Date, frequency: string, now: Date): Date | null => {
  const months = FREQUENCY_MONTHS[frequency];
  if (!months) return null;
  for (let step = 1; step <= 600; step += 1) {
    const candidate = addMonths(from, months * step);
    if (candidate.getTime() > now.getTime()) return candidate;
  }
  return null;
};

export const priceFor = (
  plan: { basePrice: unknown; cashDiscount?: unknown; transferDiscount?: unknown },
  code: PaymentMethodCode | null,
) => {
  const base = Number(plan.basePrice);
  const rawDiscount =
    code === 'transferencia' ? plan.transferDiscount : code === 'efectivo' ? plan.cashDiscount : 0;
  const discount = Number(rawDiscount ?? 0);
  return Math.round(base * (1 - discount / 100) * 100) / 100;
};
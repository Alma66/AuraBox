export const AURABOX_COMMISSION = 200;

export const AUTO_CONFIRM_TRANSFERS = true;

export type PaymentMethodCode = 'mercadopago' | 'tarjeta' | 'transferencia';

export const PAYMENT_METHOD_CODES: PaymentMethodCode[] = ['mercadopago', 'tarjeta', 'transferencia'];

export const PAYMENT_METHOD_KEYWORDS: Record<PaymentMethodCode, string> = {
  mercadopago: 'mercado',
  tarjeta: 'tarjeta',
  transferencia: 'transfer',
};

export const PAYMENT_METHOD_DEFAULT_NAMES: Record<PaymentMethodCode, string> = {
  mercadopago: 'Mercado Pago',
  tarjeta: 'Tarjeta de crédito/débito',
  transferencia: 'Transferencia bancaria',
};

export const codeFromMethodName = (name: string): PaymentMethodCode | null => {
  const lower = name.toLowerCase();
  const found = PAYMENT_METHOD_CODES.find((code) => lower.includes(PAYMENT_METHOD_KEYWORDS[code]));
  return found ?? null;
};
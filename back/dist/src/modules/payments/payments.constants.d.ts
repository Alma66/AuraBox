export declare const AURABOX_COMMISSION = 200;
export declare const AUTO_CONFIRM_TRANSFERS = true;
export type PaymentMethodCode = 'mercadopago' | 'tarjeta' | 'transferencia' | 'efectivo';
export declare const PAYMENT_METHOD_CODES: PaymentMethodCode[];
export declare const PAYMENT_METHOD_KEYWORDS: Record<PaymentMethodCode, string>;
export declare const PAYMENT_METHOD_DEFAULT_NAMES: Record<PaymentMethodCode, string>;
export declare const codeFromMethodName: (name: string) => PaymentMethodCode | null;

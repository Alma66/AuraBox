import { PaymentMethodCode } from '../../modules/payments/payments.constants';
export declare const addMonths: (from: Date, months: number) => Date;
export declare const nextPaymentFrom: (from: Date, frequency: string) => Date | null;
export declare const nextFutureDate: (from: Date, frequency: string, now: Date) => Date | null;
export declare const priceFor: (plan: {
    basePrice: unknown;
    cashDiscount?: unknown;
    transferDiscount?: unknown;
}, code: PaymentMethodCode | null) => number;

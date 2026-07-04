import { PaymentStatus } from '@prisma/client';
export declare class CreateTransactionHistoryDto {
    idUser: number;
    idUserSubscriptions: number;
    idGatewayTransaction?: string;
    idClub?: number;
    idPaymentMethods?: number;
    totalAmountPaid: number;
    clubAmount: number;
    commissionAmount: number;
    paymentDate?: string;
    paymentStatus: PaymentStatus;
    paymentNotes?: string;
}

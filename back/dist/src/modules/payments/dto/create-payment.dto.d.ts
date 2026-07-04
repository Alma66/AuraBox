import { PaymentStatus } from '@prisma/client';
export declare class CreatePaymentDto {
    idUserSubscription: number;
    idUser: number;
    idClub: number;
    idGatewayTransaction?: number;
    idPaymentMethods?: number;
    totalAmountPaid: number;
    clubAmount: number;
    commissionAmount: number;
    paymentDate?: string;
    paymentStatus: PaymentStatus;
}

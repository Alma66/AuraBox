export declare class CreateUserSubscriptionDto {
    idUser?: number;
    idSubscriptionTypes: number;
    idPaymentMethods?: number;
    startDate?: Date;
    expectedEndDate?: Date;
    monthlyAmountPaid?: string;
    cancellationReason?: string;
    cancellationDate?: Date;
}

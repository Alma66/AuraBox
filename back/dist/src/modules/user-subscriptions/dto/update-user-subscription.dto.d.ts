import { SubscriptionStatus } from '@prisma/client';
export declare class UpdateUserSubscriptionDto {
    subscriptionStatus?: SubscriptionStatus;
    lastPaymentDate?: Date;
    nextPaymentDate?: Date;
    monthlyAmountPaid?: string;
    cancellationReason?: string;
    cancellationDate?: Date;
}

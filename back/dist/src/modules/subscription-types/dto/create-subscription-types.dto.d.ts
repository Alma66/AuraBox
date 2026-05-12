import { Frequency } from '@prisma/client';
export declare class CreateSubscriptionTypeDto {
    idClub: number;
    name: string;
    description?: string;
    basePrice: string;
    frequency: Frequency;
    cashDiscount?: string;
    transferDiscount?: string;
    active?: boolean;
}

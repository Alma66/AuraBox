import { Frequency } from '@prisma/client';
export declare class CreateSubscriptionTypeDto {
    idClub: number;
    name: string;
    description?: string;
    basePrice?: string;
    price?: string;
    frequency: Frequency;
    cashDiscount?: string;
    transferDiscount?: string;
    active?: boolean;
    shippingAreas?: string;
    includes?: string;
    imageUrl?: string;
}

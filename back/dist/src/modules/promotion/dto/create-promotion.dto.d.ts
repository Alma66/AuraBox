import { PromotionType } from '@prisma/client';
export declare class CreatePromotionDto {
    idClub: number;
    name: string;
    description?: string;
    promotionType: PromotionType;
    discountPercentage?: number;
    idSubscriptionTypes?: number;
    comboSubscriptionIds?: string;
    minSubscriptionsQty?: number;
    freeShipping?: boolean;
    couponCode?: string;
    durationMonths?: number;
    startDate?: string;
    endDate?: string;
    active?: boolean;
}

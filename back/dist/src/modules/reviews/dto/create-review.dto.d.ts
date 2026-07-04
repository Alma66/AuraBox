import { ContentType } from '@prisma/client';
export declare class CreateReviewDto {
    idUser: number;
    idClub: number;
    idSubscriptionTypes?: number;
    rating: number;
    title?: string;
    comment?: string;
    reviewDate?: string;
    lastEditDate?: string;
    active?: boolean;
    mediaUrl?: string;
    mediaType?: ContentType;
}

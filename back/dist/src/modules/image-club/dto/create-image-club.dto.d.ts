import { ContentType } from '@prisma/client';
export declare class CreateImageClubDto {
    idClub: number;
    imageUrl: string;
    description?: string;
    contentType?: ContentType;
    uploadDate?: string;
}

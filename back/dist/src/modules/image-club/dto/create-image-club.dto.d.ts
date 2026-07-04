import { ContentType, ImageSection } from '@prisma/client';
export declare class CreateImageClubDto {
    idClub: number;
    imageUrl?: string;
    description?: string;
    contentType?: ContentType;
    uploadDate?: string;
    uploadedBy?: number;
    section?: ImageSection;
    isActive?: boolean;
}

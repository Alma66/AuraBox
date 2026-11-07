import { DocumentType } from '@prisma/client';
export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    password?: string;
    currentPassword?: string;
    documentType?: DocumentType;
    documentNumber?: number;
    phoneNumber?: string | null;
    birthDate?: string;
    streetAddress?: string;
    addressNumber?: number;
    floorNumber?: string;
    addressDetails?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    acceptsNewsletter?: boolean;
    gender?: string;
    country?: string;
    showGenderPublicly?: boolean;
    active?: boolean;
    latitude?: number;
    longitude?: number;
}

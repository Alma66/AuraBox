import { DocumentType } from '@prisma/client';
export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    password?: string;
    documentType?: DocumentType;
    documentNumber?: number;
    phoneNumber?: number;
    birthDate?: string;
    streetAddress?: string;
    addressNumber?: number;
    floorNumber?: string;
    addressDetails?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    acceptsNewsletter?: boolean;
}

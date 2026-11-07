import { DocumentType } from '@prisma/client';
export declare class CreateEntrepreneurDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    documentType: DocumentType;
    documentNumber: number;
    cuitCuil?: number;
    phoneNumber?: string | null;
    birthDate: string;
    city?: string;
    province?: string;
    active?: boolean;
    bio?: string;
    gender?: string;
    country?: string;
    streetAddress?: string;
    addressNumber?: number;
    floorNumber?: string;
    addressDetails?: string;
    postalCode?: string;
    showGenderPublicly?: boolean;
}

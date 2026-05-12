import { DocumentType } from '@prisma/client';
export declare class CreateEntrepreneurDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    documentType: DocumentType;
    documentNumber: number;
    cuitCuil?: number;
    phoneNumber?: number;
    birthDate: string;
    city?: string;
    province?: string;
    active?: boolean;
}

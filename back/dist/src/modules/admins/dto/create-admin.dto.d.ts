import { DocumentType } from '@prisma/client';
export declare class CreateAdminDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    documentType: DocumentType;
    documentNumber: number;
    phoneNumber?: string | null;
    notes?: string;
}

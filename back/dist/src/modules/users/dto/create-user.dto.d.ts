import { DocumentType } from '@prisma/client';
export declare class CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    documentType: DocumentType;
    documentNumber: number;
    phoneNumber?: string | null;
    birthDate: string;
    userType: 'customer' | 'entrepreneur';
}

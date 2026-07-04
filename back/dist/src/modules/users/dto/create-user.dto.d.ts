import { DocumentType } from '@prisma/client';
export declare class CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    documentType: DocumentType;
    documentNumber: number;
    phoneNumber?: number;
    birthDate: string;
    userType: 'customer' | 'entrepreneur';
}

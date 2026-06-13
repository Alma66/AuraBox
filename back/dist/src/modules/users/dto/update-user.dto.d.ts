import { DocumentType } from '@prisma/client';
export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    password?: string;
    documentType?: DocumentType;
    documentNumber?: number;
}

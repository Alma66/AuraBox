import { FinancialEntryType, FinancialEntryStatus } from '@prisma/client';
export declare class CreateFinancialEntryDto {
    idClub: number;
    type: FinancialEntryType;
    category: string;
    description: string;
    amount: number;
    entryDate?: string;
    status?: FinancialEntryStatus;
}

import { IsInt, IsString, IsNumber, Min, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { FinancialEntryType, FinancialEntryStatus } from '@prisma/client';

export class CreateFinancialEntryDto {
  @IsInt()
  idClub!: number;

  @IsEnum(FinancialEntryType)
  type!: FinancialEntryType;

  @IsString()
  category!: string;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsDateString()
  entryDate?: string;

  @IsOptional()
  @IsEnum(FinancialEntryStatus)
  status?: FinancialEntryStatus;
}
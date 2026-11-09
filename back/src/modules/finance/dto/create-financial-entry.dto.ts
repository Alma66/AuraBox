import { Transform } from 'class-transformer';
import {
  IsInt, IsString, IsNumber, Min, Max, IsEnum, IsOptional, IsDateString, MaxLength, MinLength,
} from 'class-validator';
import { FinancialEntryType, FinancialEntryStatus } from '@prisma/client';

export class CreateFinancialEntryDto {
  @IsInt()
  idClub!: number;

  @IsEnum(FinancialEntryType)
  type!: FinancialEntryType;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  category!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1, { message: 'La descripción es obligatoria' })
  @MaxLength(200, { message: 'La descripción puede tener hasta 200 caracteres' })
  description!: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El monto debe ser un número con hasta 2 decimales' })
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  @Max(99999999, { message: 'El monto es demasiado alto' })
  amount!: number;

  @IsOptional()
  @IsDateString()
  entryDate?: string;

  @IsOptional()
  @IsEnum(FinancialEntryStatus)
  status?: FinancialEntryStatus;
}
import { 
  IsBoolean, IsInt, IsOptional, IsString, MinLength, IsEnum, IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Frequency } from '@prisma/client';

export class CreateSubscriptionTypeDto {
  @IsInt()
  @Transform(({ value, obj }) => {
    const v = value ?? obj?.clubId;
    return v !== undefined ? Number(v) : v;
  })
  idClub!: number;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Transform(({ value, obj }) => {
    const v = value ?? obj?.price;
    return v !== undefined ? String(v) : v;
  })
  basePrice!: string;

  @IsEnum(Frequency)
  @Transform(({ value, obj }) => {
    const raw = value ?? obj?.deliveryFrequency ?? '';
    const map: Record<string, string> = {
      'Única': 'Unica', 'Unica': 'Unica',
      'Mensual': 'Mensual',
      'Bimestral': 'Bimestral',
      'Trimestral': 'Trimestral',
      'Cuatrimestral': 'Cuatrimestral',
      'Quinquemestral': 'Quinquemestral',
      'Semestral': 'Semestral',
      'Anual': 'Anual',
    };
    return map[raw] ?? raw;
  })
  frequency!: Frequency;

  @IsOptional()
  @Transform(({ value, obj }) => {
    const v = value ?? obj?.descuentoEfectivo;
    return v !== undefined && v !== null ? String(v) : undefined;
  })
  cashDiscount?: string;

  @IsOptional()
  @Transform(({ value, obj }) => {
    const v = value ?? obj?.descuentoTransferencia;
    return v !== undefined && v !== null ? String(v) : undefined;
  })
  transferDiscount?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value, obj }) => {
    const v = value ?? obj?.activo;
    return v !== undefined ? Boolean(v) : true;
  })
  active?: boolean;
}
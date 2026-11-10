import {
  IsBoolean, IsInt, IsOptional, IsString, MinLength, MaxLength, IsEnum,
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

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(80, { message: 'El nombre puede tener hasta 80 caracteres' })
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'La descripción puede tener hasta 1000 caracteres' })
  description?: string;

  @IsOptional()
  @Transform(({ value, obj }) => {
    const v = value ?? obj?.price;
    return v !== undefined ? String(v) : v;
  })
  basePrice?: string;

  @IsOptional()
  @Transform(({ value }) => value !== undefined && value !== null ? String(value) : undefined)
  @IsString()
  price?: string;

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

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Las zonas de envío pueden tener hasta 200 caracteres' })
  shippingAreas?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'La lista de lo que incluye es demasiado larga' })
  includes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;
}
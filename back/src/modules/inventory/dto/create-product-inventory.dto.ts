import { Transform } from 'class-transformer';
import { IsInt, IsString, IsOptional, IsNumber, Min, Max, IsBoolean, MaxLength, MinLength } from 'class-validator';

export class CreateProductInventoryDto {
  @IsInt()
  idClub!: number;

  @IsInt()
  idSupplyCategory!: number;

  @IsOptional()
  @IsInt()
  idSupplier?: number;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1, { message: 'El nombre es obligatorio' })
  @MaxLength(120, { message: 'El nombre puede tener hasta 120 caracteres' })
  name!: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(300, { message: 'La descripción puede tener hasta 300 caracteres' })
  description?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(30)
  unitType!: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'El stock no puede ser negativo' })
  @Max(99999999)
  currentStock?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'El stock mínimo no puede ser negativo' })
  @Max(99999999)
  minStock?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'El costo no puede ser negativo' })
  @Max(99999999)
  costPerUnit?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
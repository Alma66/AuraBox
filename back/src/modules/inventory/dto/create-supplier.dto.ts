import { Transform } from 'class-transformer';
import {
  IsInt, IsString, IsOptional, IsEmail, IsBoolean, IsArray, ArrayMaxSize, MaxLength, MinLength,
} from 'class-validator';

export class CreateSupplierDto {
  @IsInt()
  idClub!: number;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1, { message: 'El nombre es obligatorio' })
  @MaxLength(120, { message: 'El nombre puede tener hasta 120 caracteres' })
  name!: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'El email no es válido' })
  @MaxLength(120)
  contactEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  contactPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @IsInt({ each: true })
  categoryIds?: number[];
}
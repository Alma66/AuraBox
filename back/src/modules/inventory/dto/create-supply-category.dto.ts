import { Transform } from 'class-transformer';
import { IsInt, IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateSupplyCategoryDto {
  @IsInt()
  idClub!: number;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1, { message: 'El nombre es obligatorio' })
  @MaxLength(80, { message: 'El nombre puede tener hasta 80 caracteres' })
  name!: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MaxLength(200, { message: 'La descripción puede tener hasta 200 caracteres' })
  description?: string;
}
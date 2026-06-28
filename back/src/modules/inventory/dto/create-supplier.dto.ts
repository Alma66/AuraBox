import { IsInt, IsString, IsOptional, IsEmail, IsBoolean, IsArray } from 'class-validator';

export class CreateSupplierDto {
  @IsInt()
  idClub!: number;

  @IsString()
  name!: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsArray()
  categoryIds?: number[];
}
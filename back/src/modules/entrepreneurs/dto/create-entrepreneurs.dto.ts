import {
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { DocumentType } from '@prisma/client';

export class CreateEntrepreneurDto {
  @IsString()
  @MinLength(2)
  firstName!: string;

  @IsString()
  @MinLength(2)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe tener al menos una mayúscula, una minúscula y un número',
  })
  password!: string;

  @IsEnum(DocumentType)
  documentType!: DocumentType;

  @IsInt()
  documentNumber!: number;

  @IsOptional()
  @IsInt()
  cuitCuil?: number;

  @IsOptional()
  @IsInt()
  phoneNumber?: number;

  @IsDateString()
  birthDate!: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  streetAddress?: string;

  @IsOptional()
  @IsInt()
  addressNumber?: number;

  @IsOptional()
  @IsString()
  floorNumber?: string;

  @IsOptional()
  @IsString()
  addressDetails?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsBoolean()
  showGenderPublicly?: boolean;
}
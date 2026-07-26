import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsEmail,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { DocumentType } from '@prisma/client';

export class UpdateEntrepreneurDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe tener al menos una mayúscula, una minúscula y un número',
  })
  password?: string;

  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @IsOptional()
  @IsInt()
  documentNumber?: number;

  @IsOptional()
  @IsInt()
  cuitCuil?: number;

  @IsOptional()
  @IsInt()
  phoneNumber?: number;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

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
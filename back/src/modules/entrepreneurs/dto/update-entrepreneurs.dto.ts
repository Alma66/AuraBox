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
import { NormalizePhone, PHONE_MESSAGE, PHONE_REGEX } from '../../../common/utils/phone';

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
  @NormalizePhone()
  @Matches(PHONE_REGEX, { message: PHONE_MESSAGE })
  phoneNumber?: string | null;

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
  @MaxLength(400)
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
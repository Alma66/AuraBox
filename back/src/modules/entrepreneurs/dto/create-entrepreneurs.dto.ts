import {
  IsString,
  IsEmail,
  IsOptional,
  IsInt,
  MinLength,
  IsEnum,
  IsDateString,
} from 'class-validator';

import { DocumentType } from '@prisma/client';

export class CreateEntrepreneurDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
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
  active?: boolean;
}
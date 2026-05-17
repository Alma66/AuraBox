import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  MinLength,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { DocumentType } from '@prisma/client';

export class CreateAdminDto {
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

  @IsInt()
  phoneNumber!: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
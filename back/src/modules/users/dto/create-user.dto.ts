import { IsEmail, IsEnum, IsInt, IsString, MinLength, IsDateString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { DocumentType } from '@prisma/client';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(DocumentType)
  documentType: DocumentType;

  @Transform(({ value }) => (value === null || value === undefined ? value : parseInt(String(value), 10)))
  @IsInt()
  documentNumber: number;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === undefined ? value : parseInt(String(value), 10)))
  @IsInt()
  phoneNumber?: number;

  @IsDateString()
  birthDate: string; 

  userType: 'customer' | 'entrepreneur';
}
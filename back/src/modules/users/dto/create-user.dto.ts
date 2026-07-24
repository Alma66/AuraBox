import {
  IsEmail,
  IsEnum,
  IsInt,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DocumentType } from '@prisma/client';

export class CreateUserDto {
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

  @Transform(({ value }) => (value === null || value === undefined ? value : parseInt(String(value), 10)))
  @IsInt()
  documentNumber!: number;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === undefined ? value : parseInt(String(value), 10)))
  @IsInt()
  phoneNumber?: number;

  @IsDateString()
  birthDate!: string;

  userType!: 'customer' | 'entrepreneur';
}
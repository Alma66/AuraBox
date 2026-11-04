import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  lastName!: string;

  @IsEmail()
  @MaxLength(150)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsEnum(DocumentType)
  documentType!: DocumentType;

  @IsInt()
  @Min(1)
  @Max(2147483647)
  documentNumber!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  phoneNumber?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
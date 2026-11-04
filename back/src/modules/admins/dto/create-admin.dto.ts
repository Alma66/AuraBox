import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';
import { DocumentType } from '@prisma/client';
import { NormalizePhone, PHONE_MESSAGE, PHONE_REGEX } from '../../../common/utils/phone';

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
  @NormalizePhone()
  @Matches(PHONE_REGEX, { message: PHONE_MESSAGE })
  phoneNumber?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
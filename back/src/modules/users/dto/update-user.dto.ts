import { IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { DocumentType } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === undefined ? value : parseInt(String(value), 10)))
  @IsInt()
  documentNumber?: number;
}

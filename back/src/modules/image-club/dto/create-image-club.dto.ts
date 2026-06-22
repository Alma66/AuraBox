import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsEnum,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ContentType, ImageSection } from '@prisma/client';

export class CreateImageClubDto {
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  idClub!: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @IsOptional()
  @IsDateString()
  uploadDate?: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === null || value === '' ? undefined : parseInt(value, 10)))
  @IsInt()
  uploadedBy?: number;

  @IsOptional()
  @IsEnum(ImageSection)
  section?: ImageSection;

  @IsOptional()
  @Transform(({ value }) => (value === 'true' || value === true))
  @IsBoolean()
  isActive?: boolean;
}
import { 
  IsInt, 
  IsOptional, 
  IsString, 
  IsUrl, 
  IsEnum, 
  IsDateString,
} from 'class-validator';
import { ContentType } from '@prisma/client';

export class CreateImageClubDto {
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
}
import {
  IsInt, IsOptional, IsString, IsDateString, IsBoolean, Min, Max, IsEnum, IsUrl,
} from 'class-validator';
import { ContentType } from '@prisma/client';

export class CreateReviewDto {
  @IsInt()
  idUser!: number;

  @IsInt()
  idClub!: number;

  @IsOptional()
  @IsInt()
  idSubscriptionTypes?: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsDateString()
  reviewDate?: string;

  @IsOptional()
  @IsDateString()
  lastEditDate?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsUrl()
  mediaUrl?: string;

  @IsOptional()
  @IsEnum(ContentType)
  mediaType?: ContentType;
}
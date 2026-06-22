import {
  IsInt, IsOptional, IsString, IsEnum, IsBoolean,
  IsDateString, IsNumber, Min, Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PromotionType } from '@prisma/client';

export class CreatePromotionDto {
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  idClub!: number;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(PromotionType)
  promotionType!: PromotionType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === null || value === '' ? undefined : parseInt(value, 10)))
  @IsInt()
  idSubscriptionTypes?: number;

  @IsOptional()
  @IsString()
  comboSubscriptionIds?: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === null || value === '' ? undefined : parseInt(value, 10)))
  @IsInt()
  minSubscriptionsQty?: number;

  @IsOptional()
  @IsBoolean()
  freeShipping?: boolean;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === null || value === '' ? undefined : parseInt(value, 10)))
  @IsInt()
  durationMonths?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

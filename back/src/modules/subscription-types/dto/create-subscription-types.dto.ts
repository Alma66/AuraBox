import { IsBoolean, IsInt, IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { Frequency } from '@prisma/client';

export class CreateSubscriptionTypeDto {
  @IsInt()
  idClub: number;

  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Transform(({ value }) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'number') return value.toString();
    return String(value);
  })
  basePrice: string;

  @IsEnum(Frequency)
  frequency: Frequency;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === undefined ? value : String(value)))
  cashDiscount?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === undefined ? value : String(value)))
  transferDiscount?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
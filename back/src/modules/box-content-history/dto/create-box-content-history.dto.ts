import {
  IsInt,
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

function toBoolean({ value }: { value: any }) {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return value;
}

export class CreateBoxContentHistoryDto {
  @IsInt()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  idSubscriptionTypes!: number;

  @IsString()
  @MaxLength(7)
  deliveryMonthYear!: string;

  @IsString()
  productName!: string;

  @IsString()
  productDescription!: string;

  @IsOptional()
  @IsString()
  usageInstructions?: string;

  @IsOptional()
  @IsDateString()
  productExpirationDate?: string;

  @IsOptional()
  @IsString()
  productImageUrl?: string;

  @IsOptional()
  @IsString()
  productVideoUrl?: string;

  @IsOptional()
  @IsString()
  additionalNotes?: string;

  @IsOptional()
  @IsDateString()
  publicationDate?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(toBoolean)
  ageRestriction?: boolean;

  @IsOptional()
  @IsString()
  originLocation?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(toBoolean)
  containsAllergens?: boolean;

  @IsOptional()
  @IsString()
  allergensDetail?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(toBoolean)
  isDangerousItem?: boolean;

  @IsOptional()
  @IsString()
  dangerDetail?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(toBoolean)
  requiresCleaning?: boolean;

  @IsOptional()
  @IsString()
  cleaningInstructions?: string;
}
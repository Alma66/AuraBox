import {
  IsInt,
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CreateBoxContentHistoryDto {
  @IsInt()
  idSubscriptionTypes: number;

  @IsString()
  @MaxLength(30)
  deliveryMonthYear: string;  

  @IsString()
  productName: string;

  @IsString()
  productDescription: string;

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
}
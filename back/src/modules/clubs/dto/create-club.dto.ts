import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ClubStatus } from '@prisma/client';

export class CreateClubDto {
  @IsString()
  @MinLength(3)
  name!: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  slogan?: string;

  @IsOptional()
  @IsString()
  history?: string;

  @IsString()
  shortDescription!: string;

  @IsEmail()
  contactEmail!: string;

  @IsOptional()
  @IsString()
  whatsappContact?: string;

  @IsOptional()
  @IsEnum(ClubStatus)
  clubStatus?: ClubStatus;

  @IsOptional()
  @IsString()
  milestones?: string;

  @IsOptional()
  @IsString()
  communityText?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  shippingWindowStartDay?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  shippingWindowEndDay?: number;
}
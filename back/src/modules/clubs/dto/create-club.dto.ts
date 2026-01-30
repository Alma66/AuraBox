import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ClubStatus } from '@prisma/client';

export class CreateClubDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  logoUrl: string;

  @IsOptional()
  @IsString()
  slogan?: string;

  @IsOptional()
  @IsString()
  history?: string;

  @IsString()
  shortDescription: string;

  @IsEmail()
  contactEmail: string;

  @IsOptional()
  @IsString()
  whatsappContact?: string;

  @IsOptional()
  clubStatus?: ClubStatus;
}

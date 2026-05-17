import {
  IsInt,
  IsOptional,
  IsDateString,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateEntrepreneurLicenseDto {
  @IsInt()
  idEntrepreneurs!: number;

  @IsInt()
  idLicenseTypes!: number;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsUrl()
  documentUrl?: string;

  @IsOptional()
  @IsString()
  verificationNotes?: string;
}
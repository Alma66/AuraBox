import {
  IsOptional,
  IsDateString,
  IsString,
  IsUrl,
} from 'class-validator';

export class UpdateEntrepreneurLicenseDto {
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
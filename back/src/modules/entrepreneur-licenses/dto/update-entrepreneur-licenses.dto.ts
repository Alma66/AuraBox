import { IsDateString, IsOptional } from 'class-validator';

export class UpdateEntrepreneurLicenseDto {
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;
}
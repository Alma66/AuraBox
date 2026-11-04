import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateEntrepreneurLicenseDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  idEntrepreneurs?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  idLicenseTypes!: number;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;
}
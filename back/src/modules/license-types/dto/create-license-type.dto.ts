import { 
  IsString, 
  IsOptional,
 } from 'class-validator';

export class CreateLicenseTypeDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
import { 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsDateString,
 } from 'class-validator';

export class CreatePlatformRuleDto {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsString()
  version!: string;

  @IsOptional()
  @IsDateString()
  publicationDate?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsString()
  ruleType!: string;
}
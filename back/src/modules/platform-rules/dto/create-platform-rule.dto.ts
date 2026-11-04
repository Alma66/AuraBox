import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { RuleAcceptanceScope } from '@prisma/client';

export class CreatePlatformRuleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50000)
  content!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  version!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  ruleType!: string;

  @IsOptional()
  @IsEnum(RuleAcceptanceScope)
  acceptanceScope?: RuleAcceptanceScope;
}
import { IsOptional, IsArray } from 'class-validator';

export class UpdateClubLegalContentDto {
  @IsOptional()
  @IsArray()
  termsAndConditions?: any[];

  @IsOptional()
  @IsArray()
  privacyAndSecurityPolicy?: any[];
}
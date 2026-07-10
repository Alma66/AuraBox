import { IsInt, IsOptional, IsArray } from 'class-validator';

export class CreateClubLegalContentDto {
  @IsInt()
  idClub!: number;

  @IsOptional()
  @IsArray()
  termsAndConditions?: any[];

  @IsOptional()
  @IsArray()
  privacyAndSecurityPolicy?: any[];
}
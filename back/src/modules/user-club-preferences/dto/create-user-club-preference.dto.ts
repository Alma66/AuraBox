import { 
  IsInt, 
  IsString, 
  IsOptional, 
  IsDateString,
 } from 'class-validator';

export class CreateUserClubPreferenceDto {
  @IsInt()
  idUser!: number;

  @IsInt()
  idSubscriptionTypes!: number;

  @IsInt()
  idClub!: number;

  @IsString()
  preferenceType!: string;

  @IsString()
  preferenceValue!: string;

  @IsOptional()
  @IsDateString()
  updateDate?: string;
}
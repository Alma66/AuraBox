import { IsInt, IsOptional, IsDateString } from 'class-validator';

export class CreateEntrepreneurClubDto {
  @IsInt()
  idEntrepreneurs: number;

  @IsInt()
  idClub: number;

  @IsOptional()
  @IsDateString()
  associationDate?: string; 
}
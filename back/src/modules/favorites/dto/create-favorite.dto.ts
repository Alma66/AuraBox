import { 
  IsInt, 
  IsOptional, 
  IsDateString,
 } from 'class-validator';

export class CreateFavoriteDto {
  @IsInt()
  idUser!: number;

  @IsInt()
  idClub!: number;

  @IsOptional()
  @IsDateString()
  dateAdded?: string;
}
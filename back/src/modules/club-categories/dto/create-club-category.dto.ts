import { 
  IsInt,
 } from 'class-validator';

export class CreateClubCategoryDto {
  @IsInt()
  idCategories!: number;

  @IsInt()
  idClub!: number;
}
import { 
  IsInt, 
  IsOptional, 
  IsString, 
  IsDateString, 
  IsBoolean, 
  Min, 
  Max,
 } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  idUser!: number;

  @IsInt()
  idClub!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsDateString()
  reviewDate?: string;

  @IsOptional()
  @IsDateString()
  lastEditDate?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
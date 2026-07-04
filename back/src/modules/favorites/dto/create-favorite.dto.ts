import { IsInt, IsOptional, IsDateString } from 'class-validator';

export class CreateFavoriteDto {
  @IsOptional()
  @IsInt()
  idUser?: number;

  @IsInt()
  idSubscriptionTypes!: number;

  @IsOptional()
  @IsDateString()
  dateAdded?: string;
}
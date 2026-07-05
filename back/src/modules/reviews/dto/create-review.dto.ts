import { IsInt, IsOptional, IsString, Min, Max, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsInt()
  idSubscriptionTypes!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
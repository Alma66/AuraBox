import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class SetReviewVisibilityDto {
  @IsBoolean()
  isHidden!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateAdminDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  lastName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2147483647)
  phoneNumber?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
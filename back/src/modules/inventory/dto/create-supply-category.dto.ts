import { IsInt, IsString, IsOptional } from 'class-validator';

export class CreateSupplyCategoryDto {
  @IsInt()
  idClub!: number;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
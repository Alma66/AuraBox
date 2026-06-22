import { IsInt, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateForbiddenWordDto {
  @IsInt()
  idClub!: number;

  @IsString()
  word!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateCourierDto {
  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
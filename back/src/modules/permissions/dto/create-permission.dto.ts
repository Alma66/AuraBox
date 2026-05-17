import { 
  IsString, 
  IsOptional,
 } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsString()
  description!: string;
}
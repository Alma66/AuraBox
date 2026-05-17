import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsDateString,
 } from 'class-validator';
import { RoleScope } from '@prisma/client';

export class CreateRoleDto {
  @IsString()
  code!: string;

  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsEnum(RoleScope)
  scope?: RoleScope;

  @IsOptional()
  @IsDateString()
  createdAt?: string;
}
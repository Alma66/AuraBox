import { 
  IsInt, 
  IsOptional, 
  IsDateString,
 } from 'class-validator';

export class CreateRolePermissionDto {
  @IsInt()
  idRole!: number;

  @IsInt()
  idPermissions!: number;

  @IsInt()
  grantedById!: number;

  @IsOptional()
  @IsDateString()
  grantedAt?: string;
}
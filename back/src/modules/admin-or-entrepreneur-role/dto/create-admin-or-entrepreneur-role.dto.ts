import { IsInt, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { AssignedToType } from '@prisma/client';

export class CreateAdminOrEntrepreneurRoleDto {
  @IsInt()
  idRole: number;

  @IsEnum(AssignedToType)
  assignedToType: AssignedToType;

  @IsInt()
  assignedTo: number;

  @IsEnum(AssignedToType)
  assignedByType: AssignedToType;

  @IsInt()
  assignedBy: number;

  @IsOptional()
  @IsDateString()
  assignedAt?: string;
}
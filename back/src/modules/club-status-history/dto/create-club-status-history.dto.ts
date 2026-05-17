import { 
  IsInt, 
  IsEnum, 
  IsOptional, 
  IsString, 
} from 'class-validator';
import { ClubStatus } from '@prisma/client';

export class CreateClubStatusHistoryDto {
  @IsInt()
  idClub!: number;

  @IsInt()
  idAdmins!: number;

  @IsEnum(ClubStatus)
  previousStatus!: ClubStatus;

  @IsEnum(ClubStatus)
  newStatus!: ClubStatus;

  @IsOptional()
  @IsString()
  changeDate?: string;

  @IsOptional()
  @IsString()
  changeReason?: string;
}
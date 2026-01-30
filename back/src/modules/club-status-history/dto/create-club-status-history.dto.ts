import { IsInt, IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ClubStatus } from '@prisma/client';

export class CreateClubStatusHistoryDto {
  @IsInt()
  idClub: number;

  @IsInt()
  idAdmins: number;

  @IsEnum(ClubStatus)
  previousStatus: ClubStatus;

  @IsEnum(ClubStatus)
  newStatus: ClubStatus;

  @IsOptional()
  @IsBoolean()
  changeDate?: boolean;

  @IsOptional()
  @IsString()
  changeReason?: string;
}
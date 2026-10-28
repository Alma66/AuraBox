import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ClubStatus } from '@prisma/client';

export class ChangeClubStatusDto {
  @IsEnum(ClubStatus)
  status!: ClubStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
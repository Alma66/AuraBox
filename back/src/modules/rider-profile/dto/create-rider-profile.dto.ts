import { IsInt, IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { VehicleType } from '@prisma/client';

export class CreateRiderProfileDto {
  @IsInt()
  idEntrepreneur!: number;

  @IsEnum(VehicleType)
  vehicleType!: VehicleType;

  @IsOptional()
  @IsString()
  licensePlate?: string;

  @IsOptional()
  @IsBoolean()
  availability?: boolean;

  @IsOptional()
  @IsString()
  zonesCovered?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
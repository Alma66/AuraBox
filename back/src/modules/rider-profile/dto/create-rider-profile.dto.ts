import { IsInt, IsEnum, IsOptional, IsString, IsBoolean, IsNumber, Min } from 'class-validator';
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

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerKm?: number;
}
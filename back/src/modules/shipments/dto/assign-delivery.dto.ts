import { IsInt, IsOptional, IsEnum } from 'class-validator';
import { ShipmentStatus } from '@prisma/client';

export class AssignDeliveryDto {
  @IsOptional()
  @IsInt()
  idAssignedRider?: number | null;

  @IsOptional()
  @IsEnum(ShipmentStatus)
  shipmentStatus?: ShipmentStatus;
}
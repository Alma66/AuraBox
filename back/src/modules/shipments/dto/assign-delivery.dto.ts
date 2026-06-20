import { IsInt, IsOptional, IsEnum } from 'class-validator';
import { ShipmentStatus } from '@prisma/client';

export class AssignDeliveryDto {
  @IsOptional()
  @IsInt()
  idAssignedRider?: number | null;

  @IsOptional()
  @IsInt()
  idCourier?: number;

  @IsOptional()
  @IsEnum(ShipmentStatus)
  shipmentStatus?: ShipmentStatus;
}

export class AssignNewShipmentDto {
  @IsInt()
  idUser!: number;

  @IsInt()
  idUserSubscriptions!: number;

  @IsInt()
  idClub!: number;

  @IsInt()
  idCourier!: number;

  @IsOptional()
  @IsInt()
  idAssignedRider?: number;

  @IsOptional()
  boxMonthYear?: string;
}
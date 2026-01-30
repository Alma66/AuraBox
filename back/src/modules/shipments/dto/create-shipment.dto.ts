import { IsInt, IsOptional, IsDateString, IsString, IsNumber, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ShipmentStatus } from '@prisma/client';

export class CreateShipmentDto {
  @IsInt()
  idUser: number;

  @IsInt()
  idUserSubscriptions: number;

  @IsOptional()
  @IsInt()
  idClub?: number;

  @IsString()
  boxMonthYear: string;

  @IsOptional()
  @IsDateString()
  estimatedDeliveryStartDate?: string;

  @IsOptional()
  @IsDateString()
  estimatedDeliveryEndDate?: string;

  @IsOptional()
  @IsDateString()
  actualDeliveryDate?: string;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  logisticsCompany?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === undefined ? value : parseFloat(String(value))))
  @IsNumber()
  shippingCost?: number;

  @IsOptional()
  @IsString()
  shippingNotes?: string;

  @IsEnum(ShipmentStatus)
  shipmentStatus: ShipmentStatus;
}
import {
  IsInt,
  IsOptional,
  IsDateString,
  IsString,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ShipmentStatus } from '@prisma/client';

export class CreateShipmentDto {
  @IsInt()
  idUser!: number;

  @IsInt()
  idUserSubscriptions!: number;

  @IsOptional()
  @IsInt()
  idClub?: number;

  @IsOptional()
  @IsInt()
  idAssignedRider?: number;

  @IsString()
  boxMonthYear!: string;

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

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  addressNumber?: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  boxContent?: string;

  @IsOptional()
  @IsString()
  deliveryWindowFrom?: string;

  @IsOptional()
  @IsString()
  deliveryWindowTo?: string;

  @IsEnum(ShipmentStatus)
  shipmentStatus!: ShipmentStatus;
}
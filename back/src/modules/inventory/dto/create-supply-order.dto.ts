import { IsInt, IsNumber, Min, IsOptional, IsDateString, IsString, IsEnum } from 'class-validator';
import { SupplyOrderStatus } from '@prisma/client';

export class CreateSupplyOrderDto {
  @IsInt()
  idClub!: number;

  @IsInt()
  idSupplier!: number;

  @IsInt()
  idProductInventory!: number;

  @IsNumber()
  @Min(0.01)
  quantity!: number;

  @IsNumber()
  @Min(0)
  totalCost!: number;

  @IsOptional()
  @IsEnum(SupplyOrderStatus)
  status?: SupplyOrderStatus;

  @IsOptional()
  @IsDateString()
  estimatedArrival?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
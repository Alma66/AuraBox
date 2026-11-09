import { IsInt, IsNumber, Min, Max, IsOptional, IsDateString, IsString, IsEnum, MaxLength } from 'class-validator';
import { SupplyOrderStatus } from '@prisma/client';

export class CreateSupplyOrderDto {
  @IsInt()
  idClub!: number;

  @IsInt()
  idSupplier!: number;

  @IsInt()
  idProductInventory!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'La cantidad debe ser mayor a 0' })
  @Max(99999999)
  quantity!: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'El costo no puede ser negativo' })
  @Max(99999999)
  totalCost!: number;

  @IsOptional()
  @IsEnum(SupplyOrderStatus)
  status?: SupplyOrderStatus;

  @IsOptional()
  @IsDateString()
  estimatedArrival?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
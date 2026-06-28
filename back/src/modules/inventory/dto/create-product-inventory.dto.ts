import { IsInt, IsString, IsOptional, IsNumber, Min, IsBoolean } from 'class-validator';

export class CreateProductInventoryDto {
  @IsInt()
  idClub!: number;

  @IsInt()
  idSupplyCategory!: number;

  @IsOptional()
  @IsInt()
  idSupplier?: number;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  unitType!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerUnit?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
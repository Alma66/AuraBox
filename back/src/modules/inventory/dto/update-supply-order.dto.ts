import { PartialType } from '@nestjs/mapped-types';
import { CreateSupplyOrderDto } from './create-supply-order.dto';
import { IsOptional, IsDateString } from 'class-validator';

export class UpdateSupplyOrderDto extends PartialType(CreateSupplyOrderDto) {
  @IsOptional()
  @IsDateString()
  receivedDate?: string;
}
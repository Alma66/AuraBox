import { PartialType } from '@nestjs/mapped-types';
import { CreateEntrepreneurDto } from './create-entrepreneurs.dto';
import { IsOptional, IsInt } from 'class-validator';

export class UpdateEntrepreneurDto extends PartialType(CreateEntrepreneurDto) {
  @IsOptional()
  @IsInt() 
  phoneNumber?: number;  
}
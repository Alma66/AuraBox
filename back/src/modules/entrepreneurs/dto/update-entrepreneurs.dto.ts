import { PartialType } from '@nestjs/mapped-types';
import { CreateEntrepreneurDto } from './create-entrepreneurs.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateEntrepreneurDto extends PartialType(CreateEntrepreneurDto) {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  province?: string;
}
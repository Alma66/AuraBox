import { 
  IsString, 
  IsBoolean, 
  IsOptional,
 } from 'class-validator';

export class CreatePaymentMethodDto {
  @IsString()
  method!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
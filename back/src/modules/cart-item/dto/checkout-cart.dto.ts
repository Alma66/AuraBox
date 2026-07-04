import { IsOptional, IsInt } from 'class-validator';

export class CheckoutCartDto {
  @IsOptional()
  @IsInt()
  idPaymentMethods?: number;
}
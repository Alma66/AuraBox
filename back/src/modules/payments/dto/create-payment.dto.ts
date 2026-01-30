import { IsInt, IsOptional, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaymentStatus } from '@prisma/client';

export class CreatePaymentDto {
  @IsInt()
  idUserSubscription: number;

  @IsInt()
  idUser: number;

  @IsInt()
  idClub: number;

  @IsOptional()
  @IsInt()
  idGatewayTransaction?: number;

  @IsOptional()
  @IsInt()
  idPaymentMethods?: number;

  @Transform(({ value }) => (value === null || value === undefined ? value : parseFloat(String(value))))
  @IsNumber()
  totalAmountPaid: number;

  @Transform(({ value }) => (value === null || value === undefined ? value : parseFloat(String(value))))
  @IsNumber()
  clubAmount: number;

  @Transform(({ value }) => (value === null || value === undefined ? value : parseFloat(String(value))))
  @IsNumber()
  commissionAmount: number;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;
}
import { 
  IsInt, 
  IsOptional, 
  IsNumber, 
  IsString, 
  IsDateString, 
  IsEnum,
 } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaymentStatus } from '@prisma/client';

export class CreateTransactionHistoryDto {
  @IsInt()
  idUser!: number;

  @IsInt()
  idUserSubscriptions!: number;

  @IsOptional()
  @IsString()
  idGatewayTransaction?: string;

  @IsOptional()
  @IsInt()
  idClub?: number;

  @IsOptional()
  @IsInt()
  idPaymentMethods?: number;

  @Transform(({ value }) => (value === null || value === undefined ? value : parseFloat(String(value))))
  @IsNumber()
  totalAmountPaid!: number;

  @Transform(({ value }) => (value === null || value === undefined ? value : parseFloat(String(value))))
  @IsNumber()
  clubAmount!: number;

  @Transform(({ value }) => (value === null || value === undefined ? value : parseFloat(String(value))))
  @IsNumber()
  commissionAmount!: number;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsEnum(PaymentStatus)
  paymentStatus!: PaymentStatus;

  @IsOptional()
  @IsString()
  paymentNotes?: string;
}
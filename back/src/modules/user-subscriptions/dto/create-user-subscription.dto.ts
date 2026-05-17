import { 
  IsInt, 
  IsOptional, 
  IsString, 
  IsDateString,
 } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserSubscriptionDto {
  @IsOptional()
  @IsInt()
  idUser?: number;

  @IsInt()
  idSubscriptionTypes!: number;

  @IsOptional()
  @IsInt()
  idPaymentMethods?: number;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  expectedEndDate?: Date;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === undefined ? value : String(value)))
  monthlyAmountPaid?: string;

  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  cancellationDate?: Date;
}
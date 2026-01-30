import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { SubscriptionStatus } from '@prisma/client';

export class UpdateUserSubscriptionDto {
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  subscriptionStatus?: SubscriptionStatus;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  lastPaymentDate?: Date;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  nextPaymentDate?: Date;

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
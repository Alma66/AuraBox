import { IsOptional, IsEnum, IsString, IsDate, IsNumberString, MaxLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SubscriptionStatus } from '@prisma/client';

export class UpdateUserSubscriptionDto {
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  subscriptionStatus?: SubscriptionStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastPaymentDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  nextPaymentDate?: Date;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === undefined ? value : String(value)))
  @IsNumberString()
  monthlyAmountPaid?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancellationReason?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  cancellationDate?: Date;
}
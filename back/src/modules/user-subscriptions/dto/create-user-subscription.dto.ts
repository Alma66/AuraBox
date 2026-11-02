import { IsInt, IsOptional, IsString, IsDate, IsNumberString, MaxLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';

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
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expectedEndDate?: Date;

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
import { IsInt, IsOptional } from 'class-validator';

export class CreateCartItemDto {
  @IsInt()
  idSubscriptionTypes!: number;

  @IsOptional()
  @IsInt()
  idPreferredCourier?: number;
}
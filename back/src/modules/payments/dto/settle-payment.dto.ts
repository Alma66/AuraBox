import { IsIn } from 'class-validator';

export class SettlePaymentDto {
  @IsIn(['confirm', 'reject'])
  action!: 'confirm' | 'reject';
}
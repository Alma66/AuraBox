import { IsNumber, Min } from 'class-validator';

export class SetCourierFeeDto {
  @IsNumber()
  @Min(0)
  baseFee!: number;
}
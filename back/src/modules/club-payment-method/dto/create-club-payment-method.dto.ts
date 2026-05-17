import { 
  IsInt,
 } from 'class-validator';

export class CreateClubPaymentMethodDto {
  @IsInt()
  idClub!: number;

  @IsInt()
  idPaymentMethod!: number;
}
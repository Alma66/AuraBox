import { IsString, Matches } from 'class-validator';

export class ConfirmMercadoPagoDto {
  @IsString()
  @Matches(/^[A-Za-z0-9_-]{1,64}$/, { message: 'Referencia de compra inválida' })
  ref!: string;
}
import { Transform } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { PAYMENT_METHOD_CODES, PaymentMethodCode } from '../../payments/payments.constants';

const NullableTrim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() || null : value));

export class UpdateClubBillingDto {
  @IsOptional()
  @NullableTrim()
  @IsString()
  @MaxLength(120)
  bankHolder?: string | null;

  @IsOptional()
  @NullableTrim()
  @Matches(/^\d{22}$/, { message: 'El CBU debe tener 22 dígitos' })
  bankCbu?: string | null;

  @IsOptional()
  @NullableTrim()
  @Matches(/^[A-Za-z0-9.-]{6,20}$/, {
    message: 'El alias debe tener entre 6 y 20 caracteres (letras, números, puntos o guiones)',
  })
  bankAlias?: string | null;

  @IsArray()
  @ArrayMinSize(1, { message: 'Elegí al menos un medio de pago' })
  @IsIn(PAYMENT_METHOD_CODES, { each: true })
  methods!: PaymentMethodCode[];
}
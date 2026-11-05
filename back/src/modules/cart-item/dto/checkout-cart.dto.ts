import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { PAYMENT_METHOD_CODES } from '../../payments/payments.constants';

const Trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

class CheckoutAddressDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  street!: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  streetNumber!: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  locality!: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  city!: string;

  @Trim()
  @IsString()
  @Matches(/^(\d{4}|[A-Za-z]\d{4}[A-Za-z]{3})$/, { message: 'Código postal inválido' })
  postalCode!: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  province!: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(500)
  instructions?: string;
}

class CheckoutShippingDto {
  @IsInt()
  @Min(1)
  idClub!: number;

  @IsInt()
  @Min(1)
  idCourier!: number;
}

export class CheckoutCartDto {
  @IsIn(PAYMENT_METHOD_CODES)
  paymentMethod!: string;

  @ValidateNested()
  @Type(() => CheckoutAddressDto)
  address!: CheckoutAddressDto;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CheckoutShippingDto)
  shipping?: CheckoutShippingDto[];
}
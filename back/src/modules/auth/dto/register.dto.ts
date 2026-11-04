import { Transform } from 'class-transformer';
import {
  ArrayMaxSize, IsArray, IsDateString, IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl,
  Matches, Max, MaxLength, Min, MinLength,
} from 'class-validator';
import { NormalizePhone, PHONE_MESSAGE, PHONE_REGEX } from '../../../common/utils/phone';

const Trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

const Lower = () => Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value));

const EmptyToUndefined = () =>
  Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  });

const DigitsToNumber = () =>
  Transform(({ value }) => {
    if (value === null || value === undefined || value === '') return undefined;
    const digits = String(value).replace(/\D/g, '');
    return digits ? Number(digits) : undefined;
  });

const POSTAL_CODE = /^(\d{4}|[A-Za-z]\d{4}[A-Za-z]{3})$/;

export class RegisterCustomerDto {
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(60)
  firstName!: string;

  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MaxLength(60)
  lastName!: string;

  @Lower()
  @IsEmail({}, { message: 'El email no es válido' })
  @MaxLength(120)
  email!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72, { message: 'La contraseña no puede superar los 72 caracteres' })
  @Matches(/[A-Z]/, { message: 'La contraseña debe incluir una mayúscula' })
  @Matches(/[a-z]/, { message: 'La contraseña debe incluir una minúscula' })
  @Matches(/\d/, { message: 'La contraseña debe incluir un número' })
  password!: string;

  @IsIn(['DNI', 'Pasaporte', 'LC', 'LE'], { message: 'Tipo de documento inválido' })
  documentType!: string;

  @Transform(({ value }) => (value === undefined || value === null ? value : String(value).trim()))
  @Matches(/^\d{6,9}$/, { message: 'El número de documento no es válido' })
  documentNumber!: string;

  @IsOptional()
  @NormalizePhone()
  @Matches(PHONE_REGEX, { message: PHONE_MESSAGE })
  phoneNumber?: string | null;

  @IsDateString({}, { message: 'La fecha de nacimiento no es válida' })
  birthDate!: string;

  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value.map((item) => Number(item)) : value))
  @IsArray()
  @ArrayMaxSize(20)
  @IsInt({ each: true })
  @Min(1, { each: true })
  acceptedRuleIds?: number[];
}

export class RegisterEntrepreneurDto extends RegisterCustomerDto {
  @IsOptional()
  @EmptyToUndefined()
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @EmptyToUndefined()
  @IsString()
  @MaxLength(80)
  province?: string;
}

export class CompleteCustomerProfileDto {
  @IsString()
  @IsNotEmpty({ message: 'profileToken es requerido' })
  profileToken!: string;

  @IsOptional()
  @EmptyToUndefined()
  @IsString()
  @MaxLength(120)
  streetAddress?: string;

  @IsOptional()
  @DigitsToNumber()
  @IsInt()
  @Min(0)
  @Max(99999)
  addressNumber?: number;

  @IsOptional()
  @EmptyToUndefined()
  @IsString()
  @MaxLength(20)
  floorNumber?: string;

  @IsOptional()
  @EmptyToUndefined()
  @IsString()
  @MaxLength(500)
  addressDetails?: string;

  @IsOptional()
  @EmptyToUndefined()
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @EmptyToUndefined()
  @IsString()
  @MaxLength(80)
  province?: string;

  @IsOptional()
  @EmptyToUndefined()
  @Matches(POSTAL_CODE, { message: 'El código postal no es válido' })
  postalCode?: string;
}

export class CreateClubDto {
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'El nombre del club es obligatorio' })
  @MaxLength(100)
  name!: string;

  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(500)
  shortDescription!: string;

  @Lower()
  @IsEmail({}, { message: 'El email de contacto no es válido' })
  @MaxLength(120)
  contactEmail!: string;

  @IsOptional()
  @EmptyToUndefined()
  @IsString()
  @MaxLength(150)
  slogan?: string;

  @IsOptional()
  @EmptyToUndefined()
  @IsString()
  @MaxLength(5000)
  history?: string;

  @IsOptional()
  @EmptyToUndefined()
  @IsString()
  @MaxLength(30)
  whatsappContact?: string;

  @IsOptional()
  @EmptyToUndefined()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  logoUrl?: string;
}

export class RegisterClubDto extends CreateClubDto {
  @IsString()
  @IsNotEmpty({ message: 'entrepreneurToken es requerido' })
  entrepreneurToken!: string;
}
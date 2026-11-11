import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'El email no es válido' })
  @MaxLength(120, { message: 'El email no es válido' })
  email!: string;

  @IsString({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'Credenciales inválidas' })
  @MaxLength(72, { message: 'Credenciales inválidas' })
  password!: string;
}
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class SetSiteTextDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim() : value,
  )
  @IsString()
  @MinLength(1, { message: 'El texto no puede estar vacío' })
  @MaxLength(300)
  value!: string;
}
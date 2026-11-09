import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from 'class-validator';

const clean = (value: unknown) =>
  typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim() : value;

const cleanText = ({ value }: { value: unknown }) => clean(value);
const cleanOptional = ({ value }: { value: unknown }) => {
  const result = clean(value);
  return result === '' ? undefined : result;
};
const cleanEmail = ({ value }: { value: unknown }) => {
  const result = clean(value);
  return typeof result === 'string' ? result.toLowerCase() : result;
};

export const JOB_AREAS = [
  'Tecnología',
  'Diseño',
  'Marketing y comunicación',
  'Atención al cliente',
  'Logística y operaciones',
  'Administración y finanzas',
  'Legal y cumplimiento',
  'Otra',
] as const;

export const INBOUND_STATUSES = ['Nuevo', 'En_Revision', 'Respondido', 'Archivado'] as const;
export const INBOUND_TYPES = ['Consulta', 'Trabajo'] as const;

export class ContactRequestDto {
  @Transform(cleanText)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName!: string;

  @Transform(cleanEmail)
  @IsEmail()
  @MaxLength(120)
  email!: string;

  @Transform(cleanText)
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  subject!: string;

  @Transform(cleanText)
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}

export class JobApplicationDto {
  @Transform(cleanText)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName!: string;

  @Transform(cleanEmail)
  @IsEmail()
  @MaxLength(120)
  email!: string;

  @Transform(cleanOptional)
  @IsOptional()
  @Matches(/^[0-9+()\-\s]{8,20}$/, { message: 'El teléfono no es válido' })
  phone?: string;

  @IsIn(JOB_AREAS as unknown as string[])
  area!: string;

  @Transform(cleanOptional)
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(300)
  profileUrl?: string;

  @Transform(cleanText)
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}

export class ListInboundRequestsDto {
  @IsOptional()
  @IsIn(INBOUND_TYPES as unknown as string[])
  type?: string;

  @IsOptional()
  @IsIn(INBOUND_STATUSES as unknown as string[])
  status?: string;
}

export class UpdateInboundStatusDto {
  @IsIn(INBOUND_STATUSES as unknown as string[])
  status!: string;
}
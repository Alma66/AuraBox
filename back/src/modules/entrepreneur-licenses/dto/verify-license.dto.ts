import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class VerifyLicenseDto {
  @IsIn(['APROBADO', 'RECHAZADO'])
  verificationStatus!: 'APROBADO' | 'RECHAZADO';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  verificationNotes?: string;
}
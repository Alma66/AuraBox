import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { NormalizePhone, PHONE_MESSAGE, PHONE_REGEX } from '../../../common/utils/phone';

export class UpdateAdminDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  lastName?: string;

  @IsOptional()
  @NormalizePhone()
  @Matches(PHONE_REGEX, { message: PHONE_MESSAGE })
  phoneNumber?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
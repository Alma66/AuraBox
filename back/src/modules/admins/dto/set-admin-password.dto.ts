import { IsString, MaxLength, MinLength } from 'class-validator';

export class SetAdminPasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
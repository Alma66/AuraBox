import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MaxLength } from 'class-validator';

export class SubscribeNewsletterDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(120)
  email!: string;
}

export class UnsubscribeNewsletterDto {
  @IsString()
  @Matches(/^[a-f0-9]{48}$/)
  token!: string;
}

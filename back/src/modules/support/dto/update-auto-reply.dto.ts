import { IsString, IsOptional, IsBoolean, IsEnum, MaxLength } from 'class-validator';
import { AutoReplyTrigger } from '@prisma/client';

export class UpdateAutoReplyDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEnum(AutoReplyTrigger)
  triggerType?: AutoReplyTrigger;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  triggerValue?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  replyMessage?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
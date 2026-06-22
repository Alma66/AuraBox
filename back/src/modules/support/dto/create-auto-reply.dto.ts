import { IsInt, IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { AutoReplyTrigger } from '@prisma/client';

export class CreateAutoReplyDto {
  @IsInt()
  idClub!: number;

  @IsString()
  name!: string;

  @IsEnum(AutoReplyTrigger)
  triggerType!: AutoReplyTrigger;

  @IsOptional()
  @IsString()
  triggerValue?: string;

  @IsString()
  replyMessage!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
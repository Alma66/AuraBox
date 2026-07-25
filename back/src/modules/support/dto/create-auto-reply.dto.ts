import { IsInt, IsString, IsOptional, IsBoolean, IsEnum, IsNotEmpty, MaxLength } from 'class-validator';
import { AutoReplyTrigger } from '@prisma/client';

export class CreateAutoReplyDto {
  @IsInt()
  idClub!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsEnum(AutoReplyTrigger)
  triggerType!: AutoReplyTrigger;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  triggerValue?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  replyMessage!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
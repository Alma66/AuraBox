import { IsInt, IsEnum } from 'class-validator';
import { VerificationChannel } from '@prisma/client';

export class RequestVerificationDto {
  @IsInt()
  idConversation!: number;

  @IsEnum(VerificationChannel)
  channel!: VerificationChannel;
}
import { IsInt, IsString } from 'class-validator';

export class ConfirmVerificationDto {
  @IsInt()
  idConversation!: number;

  @IsString()
  code!: string;

  @IsString()
  dni!: string;
}
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsInt()
  idConversation!: number;

  @IsOptional()
  @IsString()
  content?: string;
}
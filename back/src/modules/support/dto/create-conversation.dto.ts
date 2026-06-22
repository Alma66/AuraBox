import { IsInt, IsString } from 'class-validator';

export class CreateConversationDto {
  @IsInt()
  idClub!: number;

  @IsInt()
  idUser!: number;

  @IsInt()
  idSubscriptionTypes!: number;

  @IsString()
  subject!: string;

  @IsString()
  content!: string;
}
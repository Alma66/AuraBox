import { IsInt, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateConversationDto {
  @IsInt()
  idClub!: number;

  @IsInt()
  idSubscriptionTypes!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  subject!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content!: string;
}
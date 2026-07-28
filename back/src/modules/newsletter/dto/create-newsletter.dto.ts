import { IsInt, IsString, MinLength, MaxLength } from 'class-validator';

export class CreateNewsletterDto {
  @IsInt()
  idClub!: number;

  @IsString()
  @MinLength(3)
  @MaxLength(150)
  subject!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(20000)
  content!: string;
}
import { 
  IsInt, 
  IsString, 
  IsUrl, 
} from 'class-validator';

export class CreateClubSocialNetworkDto {
  @IsInt()
  idClub!: number;

  @IsString()
  networkType!: string;

  @IsUrl()
  profileUrl!: string;
}
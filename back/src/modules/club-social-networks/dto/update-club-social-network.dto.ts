import { PartialType } from '@nestjs/mapped-types';
import { CreateClubSocialNetworkDto } from './create-club-social-network.dto';

export class UpdateClubSocialNetworkDto extends PartialType(CreateClubSocialNetworkDto) {}
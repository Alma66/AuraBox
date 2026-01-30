import { PartialType } from '@nestjs/mapped-types';
import { CreateUserClubPreferenceDto } from './create-user-club-preference.dto';

export class UpdateUserClubPreferenceDto extends PartialType(CreateUserClubPreferenceDto) {}
import { PartialType } from '@nestjs/mapped-types';
import { CreateEntrepreneurClubDto } from './create-entrepreneur-club.dto';

export class UpdateEntrepreneurClubDto extends PartialType(CreateEntrepreneurClubDto) {}
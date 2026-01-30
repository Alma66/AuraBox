import { PartialType } from '@nestjs/mapped-types';
import { CreateImageClubDto } from './create-image-club.dto';

export class UpdateImageClubDto extends PartialType(CreateImageClubDto) {}
import { PartialType } from '@nestjs/mapped-types';
import { CreateClubCategoryDto } from './create-club-category.dto';

export class UpdateClubCategoryDto extends PartialType(CreateClubCategoryDto) {}
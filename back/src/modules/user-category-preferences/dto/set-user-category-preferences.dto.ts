import { IsArray, IsInt } from 'class-validator';

export class SetUserCategoryPreferencesDto {
  @IsArray()
  @IsInt({ each: true })
  categoryIds!: number[];
}
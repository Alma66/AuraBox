import { IsArray, IsInt } from 'class-validator';

export class SetClubCouriersDto {
  @IsArray()
  @IsInt({ each: true })
  courierIds!: number[];
}
import { IsBoolean } from 'class-validator';

export class SetRuleActiveDto {
  @IsBoolean()
  active!: boolean;
}
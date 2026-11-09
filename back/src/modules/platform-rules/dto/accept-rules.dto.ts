import { ArrayMaxSize, ArrayMinSize, IsArray, IsInt } from 'class-validator';

export class AcceptRulesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsInt({ each: true })
  ruleIds!: number[];
}
import { PartialType } from '@nestjs/mapped-types';
import { CreatePlatformRuleDto } from './create-platform-rule.dto';

export class UpdatePlatformRuleDto extends PartialType(CreatePlatformRuleDto) {}
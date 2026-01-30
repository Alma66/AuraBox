import { PartialType } from '@nestjs/mapped-types';
import { CreateSubscriptionTypeDto } from './create-subscription-types.dto';

export class UpdateSubscriptionTypeDto extends PartialType(CreateSubscriptionTypeDto) {}
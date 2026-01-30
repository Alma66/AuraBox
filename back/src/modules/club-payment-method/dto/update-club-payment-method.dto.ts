import { PartialType } from '@nestjs/mapped-types';
import { CreateClubPaymentMethodDto } from './create-club-payment-method.dto';

export class UpdateClubPaymentMethodDto extends PartialType(CreateClubPaymentMethodDto) {}
import { Module } from '@nestjs/common';
import { ClubPaymentMethodService } from './club-payment-method.service';
import { ClubPaymentMethodController } from './club-payment-method.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClubPaymentMethodController],
  providers: [ClubPaymentMethodService],
})
export class ClubPaymentMethodModule {}

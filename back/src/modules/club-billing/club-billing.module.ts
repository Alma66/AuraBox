import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ClubBillingController } from './club-billing.controller';
import { ClubBillingService } from './club-billing.service';

@Module({
  imports: [PrismaModule],
  controllers: [ClubBillingController],
  providers: [ClubBillingService],
})
export class ClubBillingModule {}
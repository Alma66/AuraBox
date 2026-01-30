import { Module } from '@nestjs/common';
import { SubscriptionTypesService } from './subscription-types.service';
import { SubscriptionTypesController } from './subscription-types.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SubscriptionTypesService],
  controllers: [SubscriptionTypesController],
})
export class SubscriptionTypesModule {}

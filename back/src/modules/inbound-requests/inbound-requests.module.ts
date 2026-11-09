import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { MailerModule } from '../mailer/mailer.module';
import { InboundRequestsService } from './inbound-requests.service';
import { InboundRequestsController } from './inbound-requests.controller';
import { InboundRequestsPublicController } from './inbound-requests-public.controller';

@Module({
  imports: [PrismaModule, MailerModule],
  controllers: [InboundRequestsPublicController, InboundRequestsController],
  providers: [InboundRequestsService],
})
export class InboundRequestsModule {}
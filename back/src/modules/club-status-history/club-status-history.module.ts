import { Module } from '@nestjs/common';
import { ClubStatusHistoryService } from './club-status-history.service';
import { ClubStatusHistoryController } from './club-status-history.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClubStatusHistoryController],
  providers: [ClubStatusHistoryService],
})
export class ClubStatusHistoryModule {}

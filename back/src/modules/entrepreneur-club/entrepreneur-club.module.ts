import { Module } from '@nestjs/common';
import { EntrepreneurClubService } from './entrepreneur-club.service';
import { EntrepreneurClubController } from './entrepreneur-club.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EntrepreneurClubController],
  providers: [EntrepreneurClubService],
})
export class EntrepreneurClubModule {}

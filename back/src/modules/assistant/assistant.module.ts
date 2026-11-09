import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { ClubSearchService } from './club-search.service';

@Module({
  imports: [PrismaModule],
  controllers: [AssistantController],
  providers: [AssistantService, ClubSearchService],
})
export class AssistantModule {}
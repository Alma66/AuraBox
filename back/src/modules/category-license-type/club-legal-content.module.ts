import { Module } from '@nestjs/common';
import { ClubLegalContentController } from './club-legal-content.controller';
import { ClubLegalContentService } from './club-legal-content.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClubLegalContentController],
  providers: [ClubLegalContentService],
  exports: [ClubLegalContentService],
})
export class ClubLegalContentModule {}
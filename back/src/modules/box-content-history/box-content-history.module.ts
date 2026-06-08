import { Module } from '@nestjs/common';
import { BoxContentHistoryService } from './box-content-history.service';
import { BoxContentHistoryController } from './box-content-history.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [BoxContentHistoryController],
  providers: [BoxContentHistoryService],
})
export class BoxContentHistoryModule {}
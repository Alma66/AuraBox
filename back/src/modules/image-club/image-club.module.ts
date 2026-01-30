import { Module } from '@nestjs/common';
import { ImageClubService } from './image-club.service';
import { ImageClubController } from './image-club.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ImageClubController],
  providers: [ImageClubService],
})
export class ImageClubModule {}

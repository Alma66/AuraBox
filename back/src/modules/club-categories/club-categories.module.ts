import { Module } from '@nestjs/common';
import { ClubCategoriesService } from './club-categories.service';
import { ClubCategoriesController } from './club-categories.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClubCategoriesController],
  providers: [ClubCategoriesService],
})
export class ClubCategoriesModule {}

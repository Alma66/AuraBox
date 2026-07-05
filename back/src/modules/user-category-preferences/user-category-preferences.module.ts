import { Module } from '@nestjs/common';
import { UserCategoryPreferencesService } from './user-category-preferences.service';
import { UserCategoryPreferencesController } from './user-category-preferences.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserCategoryPreferencesController],
  providers: [UserCategoryPreferencesService],
})
export class UserCategoryPreferencesModule {}
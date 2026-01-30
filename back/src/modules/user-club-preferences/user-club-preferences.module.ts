import { Module } from '@nestjs/common';
import { UserClubPreferencesService } from './user-club-preferences.service';
import { UserClubPreferencesController } from './user-club-preferences.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserClubPreferencesController],
  providers: [UserClubPreferencesService],
})
export class UserClubPreferencesModule {}

import { Module } from '@nestjs/common';
import { EntrepreneursService } from './entrepreneurs.service';
import { EntrepreneursController } from './entrepreneurs.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { ClubsModule } from '../clubs/clubs.module';

@Module({
  imports: [PrismaModule, ClubsModule],
  controllers: [EntrepreneursController],
  providers: [EntrepreneursService],
})
export class EntrepreneursModule {}
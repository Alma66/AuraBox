import { Module } from '@nestjs/common';
import { EntrepreneursService } from './entrepreneurs.service';
import { EntrepreneursController } from './entrepreneurs.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EntrepreneursController],
  providers: [EntrepreneursService],
})
export class EntrepreneursModule {}

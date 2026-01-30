import { Module } from '@nestjs/common';
import { EntrepreneurLicensesService } from './entrepreneur-licenses.service';
import { EntrepreneurLicensesController } from './entrepreneur-licenses.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EntrepreneurLicensesController],
  providers: [EntrepreneurLicensesService],
})
export class EntrepreneurLicensesModule {}

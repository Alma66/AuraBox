import { Module } from '@nestjs/common';
import { EntrepreneurLicensesService } from './entrepreneur-licenses.service';
import { EntrepreneurLicensesController } from './entrepreneur-licenses.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [EntrepreneurLicensesController],
  providers: [EntrepreneurLicensesService],
})
export class EntrepreneurLicensesModule {}
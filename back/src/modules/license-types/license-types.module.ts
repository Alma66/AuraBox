import { Module } from '@nestjs/common';
import { LicenseTypesService } from './license-types.service';
import { LicenseTypesController } from './license-types.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LicenseTypesController],
  providers: [LicenseTypesService],
})
export class LicenseTypesModule {}

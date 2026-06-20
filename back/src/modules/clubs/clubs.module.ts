import { Module } from '@nestjs/common';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ShipmentsModule } from '../shipments/shipments.module';
import { RiderProfileModule } from '../rider-profile/rider-profile.module';

@Module({
  imports: [PrismaModule, CloudinaryModule, ShipmentsModule, RiderProfileModule],
  controllers: [ClubsController],
  providers: [ClubsService],
  exports: [ClubsService],
})
export class ClubsModule {}
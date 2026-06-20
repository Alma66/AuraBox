import { Module } from '@nestjs/common';
import { RiderProfileService } from './rider-profile.service';
import { RiderProfileController } from './rider-profile.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RiderProfileController],
  providers: [RiderProfileService],
  exports: [RiderProfileService],
})
export class RiderProfileModule {}
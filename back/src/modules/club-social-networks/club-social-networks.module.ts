import { Module } from '@nestjs/common';
import { ClubSocialNetworksService } from './club-social-networks.service';
import { ClubSocialNetworksController } from './club-social-networks.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClubSocialNetworksController],
  providers: [ClubSocialNetworksService],
})
export class ClubSocialNetworksModule {}

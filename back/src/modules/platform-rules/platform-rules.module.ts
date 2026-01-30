import { Module } from '@nestjs/common';
import { PlatformRulesService } from './platform-rules.service';
import { PlatformRulesController } from './platform-rules.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlatformRulesController],
  providers: [PlatformRulesService],
})
export class PlatformRulesModule {}

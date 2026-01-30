import { Module } from '@nestjs/common';
import { AdminOrEntrepreneurRoleService } from './admin-or-entrepreneur-role.service';
import { AdminOrEntrepreneurRoleController } from './admin-or-entrepreneur-role.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminOrEntrepreneurRoleController],
  providers: [AdminOrEntrepreneurRoleService],
})
export class AdminOrEntrepreneurRoleModule {}

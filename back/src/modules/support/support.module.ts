import { Module } from '@nestjs/common';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [PrismaModule, CloudinaryModule, MailerModule],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
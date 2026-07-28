import { Module } from '@nestjs/common';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [MailerModule],
  controllers: [NewsletterController],
  providers: [NewsletterService],
})
export class NewsletterModule {}
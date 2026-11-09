import { Module } from '@nestjs/common';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { MailerModule } from '../mailer/mailer.module';
import { NewsletterPublicController } from './newsletter-public.controller';
import { NewsletterSubscriptionService } from './newsletter-subscription.service';

@Module({
  imports: [MailerModule],
  controllers: [NewsletterController],
  providers: [NewsletterService],
})
export class NewsletterModule {}
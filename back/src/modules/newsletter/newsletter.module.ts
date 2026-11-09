import { Module } from '@nestjs/common';
import { NewsletterController } from './newsletter.controller';
import { NewsletterPublicController } from './newsletter-public.controller';
import { NewsletterService } from './newsletter.service';
import { NewsletterSubscriptionService } from './newsletter-subscription.service';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [MailerModule],
  controllers: [NewsletterController, NewsletterPublicController],
  providers: [NewsletterService, NewsletterSubscriptionService],
})
export class NewsletterModule {}
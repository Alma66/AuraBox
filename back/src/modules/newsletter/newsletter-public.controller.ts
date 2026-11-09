import { Body, Controller, HttpCode, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { NewsletterSubscriptionService } from './newsletter-subscription.service';
import { SubscribeNewsletterDto, UnsubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('newsletter')
export class NewsletterPublicController {
  constructor(private readonly subscriptionService: NewsletterSubscriptionService) {}

  @Public()
  @Post('subscribe')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async subscribe(@Body() dto: SubscribeNewsletterDto) {
    return this.subscriptionService.subscribe(dto.email);
  }

  @Public()
  @Post('unsubscribe')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async unsubscribe(@Body() dto: UnsubscribeNewsletterDto) {
    return this.subscriptionService.unsubscribe(dto.token);
  }
}
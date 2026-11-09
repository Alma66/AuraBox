import { Body, Controller, HttpCode, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { InboundRequestsService } from './inbound-requests.service';
import { ContactRequestDto, JobApplicationDto } from './dto/inbound-request.dto';

@Controller('inbound')
export class InboundRequestsPublicController {
  constructor(private readonly service: InboundRequestsService) {}

  @Public()
  @Post('contact')
  @HttpCode(200)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async contact(@Body() dto: ContactRequestDto) {
    return this.service.createContact(dto);
  }

  @Public()
  @Post('job-application')
  @HttpCode(200)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async jobApplication(@Body() dto: JobApplicationDto) {
    return this.service.createJobApplication(dto);
  }
}
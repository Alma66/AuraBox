import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { SiteContentService } from './site-content.service';

@Controller('site-content')
export class SiteContentPublicController {
  constructor(private readonly service: SiteContentService) {}

  @Public()
  @Get()
  @Header('Cache-Control', 'public, max-age=60')
  async get() {
    return this.service.getPublic();
  }
}
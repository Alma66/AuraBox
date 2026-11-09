import { Module } from '@nestjs/common';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { SiteContentController } from './site-content.controller';
import { SiteContentPublicController } from './site-content-public.controller';
import { SiteContentService } from './site-content.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [SiteContentPublicController, SiteContentController],
  providers: [SiteContentService],
})
export class SiteContentModule {}
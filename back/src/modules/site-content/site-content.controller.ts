import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { imageUploadOptions } from '../../common/utils/image-upload';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { SetSiteTextDto } from './dto/set-site-text.dto';
import { SiteContentService } from './site-content.service';

@Controller('admin/site-content')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class SiteContentController {
  constructor(private readonly service: SiteContentService) {}

  @Get()
  async list() {
    return this.service.listForAdmin();
  }

  @Put(':key/text')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async setText(@Param('key') key: string, @Body() dto: SetSiteTextDto, @Request() req) {
    return this.service.setText(key, dto.value, req.user.id);
  }

  @Post(':key/image')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  async setImage(@Param('key') key: string, @UploadedFile() file: Express.Multer.File, @Request() req) {
    return this.service.setImage(key, file, req.user.id);
  }

  @Delete(':key')
  async reset(@Param('key') key: string) {
    return this.service.reset(key);
  }
}
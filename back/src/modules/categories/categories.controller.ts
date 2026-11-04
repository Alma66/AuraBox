import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { CloudinaryService } from './cloudinary.service';
import { imageUploadOptions } from '../../common/utils/image-upload';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('entrepreneur', 'admin')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('image')
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo');
    const url = await this.cloudinaryService.uploadImage(file, 'aurabox');
    return { url };
  }
}
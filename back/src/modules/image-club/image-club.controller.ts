import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ImageClubService } from './image-club.service';
import { CreateImageClubDto } from './dto/create-image-club.dto';
import { UpdateImageClubDto } from './dto/update-image-club.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('image-club')
@UseGuards(JwtAuthGuard)
export class ImageClubController {
  constructor(private readonly imageClubService: ImageClubService) {}

  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        callback(new Error('Solo se permiten imágenes'), false);
      } else {
        callback(null, true);
      }
    },
  }))
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Body() dto: CreateImageClubDto,
    @Request() req,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.imageClubService.create(dto, image);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  async findAll() {
    return this.imageClubService.findAll();
  }

  @Get('by-club/:idClub')
  async findByClub(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.imageClubService.findByClub(idClub);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.imageClubService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateImageClubDto,
    @Request() req,
  ) {
    return this.imageClubService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.imageClubService.remove(id);
  }
}
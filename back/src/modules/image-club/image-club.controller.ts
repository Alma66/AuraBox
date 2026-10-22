import {
  Body, Controller, Get, Post, Put, Delete,
  Param, ParseIntPipe, UseGuards, Request, UsePipes,
  ValidationPipe, UseInterceptors, UploadedFile, Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageClubService } from './image-club.service';
import { CreateImageClubDto } from './dto/create-image-club.dto';
import { UpdateImageClubDto } from './dto/update-image-club.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { imageUploadOptions } from '../../common/utils/image-upload';

@Controller('image-club')
@UseGuards(JwtAuthGuard)
export class ImageClubController {
  constructor(private readonly imageClubService: ImageClubService) {}

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Post()
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateImageClubDto, @Request() req, @UploadedFile() image?: Express.Multer.File) {
    return this.imageClubService.create(dto, image, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.imageClubService.findAll();
  }

  @Get('by-club/:idClub')
  async findByClub(@Param('idClub', ParseIntPipe) idClub: number, @Query('section') section?: string) {
    return this.imageClubService.findByClub(idClub, section);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.imageClubService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateImageClubDto, @Request() req) {
    return this.imageClubService.update(id, dto, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Delete('bulk')
  async removeMany(@Body() body: { ids: number[] }, @Request() req) {
    return this.imageClubService.removeMany(body?.ids, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.imageClubService.remove(id, req.user);
  }
}
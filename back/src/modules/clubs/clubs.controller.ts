import {
  Body, Controller, Get, Post, Param, Delete, Put, Patch,
  UseGuards, UsePipes, ValidationPipe, Request, ParseIntPipe,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

const imageFileInterceptor = FileInterceptor('logo', {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      callback(new Error('Solo se permiten imágenes'), false);
    } else {
      callback(null, true);
    }
  },
});

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('entrepreneur')
  @Post()
  @UseInterceptors(imageFileInterceptor)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateClubDto, @Request() req, @UploadedFile() logo?: Express.Multer.File) {
    return this.clubsService.create(req.user.id, dto, logo);
  }

  @Public()
  @Get('featured')
  async findFeatured() {
    return this.clubsService.findFeatured();
  }

  @Public()
  @Get()
  async findAll() {
    return this.clubsService.findAll();
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.clubsService.findOne(id, req.user?.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClubDto, @Request() req) {
    return this.clubsService.update(id, req.user.id, req.user.role, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Patch(':id/logo')
  @UseInterceptors(FileInterceptor('logo', {
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
  async updateLogo(@Param('id', ParseIntPipe) id: number, @UploadedFile() logo: Express.Multer.File, @Request() req) {
    return this.clubsService.updateLogo(id, req.user.id, req.user.role, logo);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.clubsService.remove(id, req.user.role);
  }
}
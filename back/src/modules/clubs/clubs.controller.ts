import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Request,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  Optional,
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

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @UseGuards(RolesGuard)
  @Roles('OWNER')
  @Post()
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
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Body() dto: CreateClubDto,
    @Request() req,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
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
    const requesterId: number | undefined = req.user?.id;
    return this.clubsService.findOne(id, requesterId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClubDto,
    @Request() req,
  ) {
    return this.clubsService.update(id, req.user.id, req.user.role, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.clubsService.remove(id, req.user.role);
  }
}
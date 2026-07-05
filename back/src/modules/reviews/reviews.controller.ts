import {
  Body, Controller, Get, Post, Put, Delete, Patch,
  Param, ParseIntPipe, UseGuards, Request,
  UsePipes, ValidationPipe, ForbiddenException, Query,
  UseInterceptors, UploadedFiles, BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateForbiddenWordDto } from './dto/create-forbidden-word.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

const MAX_MEDIA_FILES = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 30 * 1024 * 1024;

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateReviewDto, @Request() req) {
    return this.reviewsService.create(dto, req.user.id);
  }

  @Get('eligibility/:idSubscriptionTypes')
  async checkEligibility(
    @Param('idSubscriptionTypes', ParseIntPipe) idSubscriptionTypes: number,
    @Request() req,
  ) {
    return this.reviewsService.checkEligibility(req.user.id, idSubscriptionTypes);
  }

  @Post(':id/media')
  @UseInterceptors(FilesInterceptor('files', MAX_MEDIA_FILES, {
    storage: memoryStorage(),
    limits: { fileSize: MAX_VIDEO_BYTES },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/^(image\/(jpg|jpeg|png|gif|webp)|video\/(mp4|quicktime|webm))$/)) {
        callback(new BadRequestException('Formato de archivo no permitido'), false);
      } else {
        callback(null, true);
      }
    },
  }))
  async addMedia(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Request() req,
  ) {
    if (!files || files.length === 0) throw new BadRequestException('No se recibió ningún archivo');
    for (const file of files) {
      if (file.mimetype.startsWith('image/') && file.size > MAX_IMAGE_BYTES) {
        throw new BadRequestException('Las imágenes no pueden superar los 5MB');
      }
    }
    return this.reviewsService.addMedia(id, files, req.user.id);
  }

  @Delete(':id/media/:mediaId')
  async removeMedia(
    @Param('id', ParseIntPipe) id: number,
    @Param('mediaId', ParseIntPipe) mediaId: number,
    @Request() req,
  ) {
    return this.reviewsService.removeMedia(id, mediaId, req.user.id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.reviewsService.findAll();
  }

  @Get('by-user/:idUser')
  async findByUser(@Param('idUser', ParseIntPipe) idUser: number, @Request() req) {
    if (req.user.id !== idUser && req.user.role !== 'admin') {
      throw new ForbiddenException('No autorizado para ver estas reseñas');
    }
    return this.reviewsService.findByUser(idUser);
  }

  @Public()
  @Get('by-subscription-type/:id')
  async findBySubscriptionType(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.reviewsService.findBySubscriptionType(
      id,
      limit ? Number(limit) : 10,
      offset ? Number(offset) : 0,
    );
  }

  @Public()
  @Get('summary/by-club/:idClub')
  async getSummaryByClub(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.reviewsService.getSummaryByClub(idClub);
  }

  @Public()
  @Get('summary/by-subscription-type/:id')
  async getSummaryBySubscriptionType(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.getSummaryBySubscriptionType(id);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Get('by-club/:idClub')
  async findByClub(@Param('idClub', ParseIntPipe) idClub: number, @Query('includeHidden') includeHidden?: string) {
    return this.reviewsService.findByClub(idClub, includeHidden === 'true');
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Get('hidden-by-club/:idClub')
  async findHiddenByClub(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.reviewsService.findHiddenByClub(idClub);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Get('forbidden-words/by-club/:idClub')
  async findForbiddenWords(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.reviewsService.findForbiddenWordsByClub(idClub);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Post('forbidden-words')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createForbiddenWord(@Body() dto: CreateForbiddenWordDto) {
    return this.reviewsService.createForbiddenWord(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Patch('forbidden-words/:id/toggle')
  async toggleForbiddenWord(@Param('id', ParseIntPipe) id: number, @Body() body: { active: boolean }) {
    return this.reviewsService.toggleForbiddenWord(id, body.active);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Delete('forbidden-words/:id')
  async removeForbiddenWord(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.removeForbiddenWord(id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReviewDto, @Request() req) {
    const review = await this.reviewsService.findOne(id);
    const isOwner = req.user.id === review.idUser;
    if (!isOwner && req.user.role !== 'admin' && req.user.role !== 'entrepreneur') {
      throw new ForbiddenException('No autorizado para editar esta reseña');
    }
    return this.reviewsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const review = await this.reviewsService.findOne(id);
    const isOwner = req.user.id === review.idUser;
    if (!isOwner && req.user.role !== 'admin') {
      throw new ForbiddenException('No autorizado para eliminar esta reseña');
    }
    return this.reviewsService.remove(id);
  }
}
import {
  Body, Controller, Get, Post, Put, Delete, Patch,
  Param, ParseIntPipe, UseGuards, Request,
  UsePipes, ValidationPipe, ForbiddenException, Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateForbiddenWordDto } from './dto/create-forbidden-word.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateReviewDto, @Request() req) {
    if (req.user.id !== dto.idUser && req.user.role !== 'admin') {
      throw new ForbiddenException('No autorizado para crear esta reseña');
    }
    return this.reviewsService.create(dto);
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

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.remove(id);
  }
}
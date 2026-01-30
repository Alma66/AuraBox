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
  ForbiddenException,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
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
    if (req.user.id !== dto.idUser && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('No autorizado para crear esta reseña');
    }
    return this.reviewsService.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  async findAll() {
    return this.reviewsService.findAll();
  }

  @Get('by-user/:idUser')
  async findByUser(@Param('idUser', ParseIntPipe) idUser: number, @Request() req) {
    if (req.user.id !== idUser && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('No autorizado para ver estas reseñas');
    }
    return this.reviewsService.findByUser(idUser);
  }

  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Get('by-club/:idClub')
  async findByClub(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.reviewsService.findByClub(idClub);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.remove(id);
  }
}
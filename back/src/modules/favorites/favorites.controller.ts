import {
  Body, Controller, Get, Post, Put, Delete,
  Param, ParseIntPipe, UseGuards, Request, UsePipes,
  ValidationPipe, ForbiddenException,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateFavoriteDto, @Request() req) {
    if (req.user.id !== dto.idUser && req.user.role !== 'admin') {
      throw new ForbiddenException('No autorizado para crear este favorito');
    }
    return this.favoritesService.create(dto);
  }

  @Post('toggle/:idClub')
  async toggle(@Param('idClub', ParseIntPipe) idClub: number, @Request() req) {
    return this.favoritesService.toggle(req.user.id, idClub);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.favoritesService.findAll();
  }

  @Get('by-user/:idUser')
  async findByUser(@Param('idUser', ParseIntPipe) idUser: number, @Request() req) {
    if (req.user.id !== idUser && req.user.role !== 'admin') {
      throw new ForbiddenException('No autorizado para ver estos favoritos');
    }
    return this.favoritesService.findByUserEnriched(idUser);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Get('by-club/:idClub')
  async findByClub(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.favoritesService.findByClub(idClub);
  }

  @Get('check/:idClub')
  async check(@Param('idClub', ParseIntPipe) idClub: number, @Request() req) {
    return this.favoritesService.check(req.user.id, idClub);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const favorite = await this.favoritesService.findOne(id);
    if (req.user.role !== 'admin' && req.user.id !== favorite.idUser) {
      throw new ForbiddenException('No autorizado para ver este favorito');
    }
    return favorite;
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFavoriteDto) {
    return this.favoritesService.update(id, dto);
  }

  @Delete('by-club/:idClub')
  async removeByClub(@Param('idClub', ParseIntPipe) idClub: number, @Request() req) {
    return this.favoritesService.removeByUserAndClub(req.user.id, idClub);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.favoritesService.remove(id);
  }
}
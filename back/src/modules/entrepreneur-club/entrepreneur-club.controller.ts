import {
  Body, Controller, Get, Post, Put, Delete, Patch,
  Param, ParseIntPipe, UseGuards, Request, UsePipes,
  ValidationPipe, ForbiddenException, Query,
} from '@nestjs/common';
import { EntrepreneurClubService } from './entrepreneur-club.service';
import { CreateEntrepreneurClubDto } from './dto/create-entrepreneur-club.dto';
import { UpdateEntrepreneurClubDto } from './dto/update-entrepreneur-club.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('entrepreneur-club')
@UseGuards(JwtAuthGuard)
export class EntrepreneurClubController {
  constructor(private readonly service: EntrepreneurClubService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateEntrepreneurClubDto, @Request() req) {
    if (req.user.role !== 'admin' && req.user.id !== dto.idEntrepreneurs) {
      throw new ForbiddenException('No autorizado para crear esta asociación');
    }
    return this.service.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Get('by-club/:idClub')
  async findByClub(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.service.findByClub(idClub);
  }

  @Get('by-entrepreneur/:idEntrepreneur')
  async findByEntrepreneur(@Param('idEntrepreneur', ParseIntPipe) idEntrepreneur: number, @Request() req) {
    if (req.user.id !== idEntrepreneur && req.user.role !== 'admin') {
      throw new ForbiddenException('No autorizado para ver estas asociaciones');
    }
    return this.service.findByEntrepreneur(idEntrepreneur);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEntrepreneurClubDto, @Request() req) {
    const existing = await this.service.findOne(id);
    if (req.user.role !== 'admin' && req.user.id !== existing.idEntrepreneurs) {
      throw new ForbiddenException('No autorizado para actualizar esta asociación');
    }
    return this.service.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
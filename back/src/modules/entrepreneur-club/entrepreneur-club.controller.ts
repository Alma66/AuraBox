import {
  Body, Controller, Get, Post, Put, Delete, Patch,
  Param, ParseIntPipe, UseGuards, Request, UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EntrepreneurClubService } from './entrepreneur-club.service';
import { CreateEntrepreneurClubDto } from './dto/create-entrepreneur-club.dto';
import { UpdateEntrepreneurClubDto } from './dto/update-entrepreneur-club.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('entrepreneur-club')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EntrepreneurClubController {
  constructor(private readonly service: EntrepreneurClubService) {}

  @Roles('admin')
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateEntrepreneurClubDto) {
    return this.service.create(dto);
  }

  @Roles('admin')
  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Roles('admin')
  @Get('by-club/:idClub')
  async findByClub(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.service.findByClub(idClub);
  }

  @Roles('admin')
  @Get('by-entrepreneur/:idEntrepreneur')
  async findByEntrepreneur(@Param('idEntrepreneur', ParseIntPipe) idEntrepreneur: number, @Request() req) {
    if (req.user.id !== idEntrepreneur && req.user.role !== 'admin') {
      return this.service.findByEntrepreneur(idEntrepreneur);
    }
    return this.service.findByEntrepreneur(idEntrepreneur);
  }

  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Roles('admin')
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEntrepreneurClubDto) {
    return this.service.update(id, dto);
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
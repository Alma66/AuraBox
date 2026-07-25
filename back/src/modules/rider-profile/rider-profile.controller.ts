import {
  Body, Controller, Get, Post, Put, Delete,
  Param, ParseIntPipe, UseGuards, UsePipes, ValidationPipe, Request, ForbiddenException,
} from '@nestjs/common';
import { RiderProfileService } from './rider-profile.service';
import { CreateRiderProfileDto } from './dto/create-rider-profile.dto';
import { UpdateRiderProfileDto } from './dto/update-rider-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('rider-profile')
@UseGuards(JwtAuthGuard)
export class RiderProfileController {
  constructor(private readonly svc: RiderProfileService) {}

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateRiderProfileDto, @Request() req) {
    if (req.user.role !== 'admin' && req.user.id !== dto.idEntrepreneur) {
      throw new ForbiddenException('No autorizado para crear este perfil');
    }
    return this.svc.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.svc.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Get('by-club/:idClub')
  async findByClub(@Param('idClub', ParseIntPipe) idClub: number, @Request() req) {
    await this.svc.assertClubAccess(idClub, req.user);
    return this.svc.findByClub(idClub);
  }

  @Get('by-entrepreneur/:idEntrepreneur')
  async findByEntrepreneur(@Param('idEntrepreneur', ParseIntPipe) idEntrepreneur: number, @Request() req) {
    if (req.user.role !== 'admin' && req.user.id !== idEntrepreneur) {
      throw new ForbiddenException('No autorizado para ver este perfil');
    }
    return this.svc.findByEntrepreneur(idEntrepreneur);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.svc.findOneForRequester(id, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRiderProfileDto, @Request() req) {
    return this.svc.updateForRequester(id, dto, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
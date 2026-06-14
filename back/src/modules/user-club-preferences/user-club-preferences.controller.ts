import {
  Body, Controller, Get, Post, Put, Delete,
  Param, ParseIntPipe, UseGuards, Request,
  UsePipes, ValidationPipe, ForbiddenException,
} from '@nestjs/common';
import { UserClubPreferencesService } from './user-club-preferences.service';
import { CreateUserClubPreferenceDto } from './dto/create-user-club-preference.dto';
import { UpdateUserClubPreferenceDto } from './dto/update-user-club-preference.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('user-club-preferences')
@UseGuards(JwtAuthGuard)
export class UserClubPreferencesController {
  constructor(private readonly svc: UserClubPreferencesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateUserClubPreferenceDto, @Request() req) {
    if (req.user.id !== dto.idUser && req.user.role !== 'admin') {
      throw new ForbiddenException('No autorizado para crear esta preferencia');
    }
    return this.svc.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.svc.findAll();
  }

  @Get('by-user/:idUser')
  async findByUser(@Param('idUser', ParseIntPipe) idUser: number, @Request() req) {
    if (req.user.id !== idUser && req.user.role !== 'admin') {
      throw new ForbiddenException('No autorizado para ver estas preferencias');
    }
    return this.svc.findByUser(idUser);
  }

  @Get('by-club/:idClub')
  async findByClub(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.svc.findByClub(idClub);
  }

  @Get('by-subscription-type/:idSubscriptionTypes')
  async findBySubscriptionType(@Param('idSubscriptionTypes', ParseIntPipe) idSubscriptionTypes: number) {
    return this.svc.findBySubscriptionType(idSubscriptionTypes);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserClubPreferenceDto, @Request() req) {
    return this.svc.update(id, dto, req.user);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.svc.remove(id, req.user);
  }
}
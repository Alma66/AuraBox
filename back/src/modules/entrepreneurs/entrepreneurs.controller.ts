import {
  Body, Controller, Get, Post, Put, Delete, Patch,
  Param, ParseIntPipe, UseGuards, Request, UsePipes,
  ValidationPipe, ForbiddenException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { EntrepreneursService } from './entrepreneurs.service';
import { CreateEntrepreneurDto } from './dto/create-entrepreneurs.dto';
import { UpdateEntrepreneurDto } from './dto/update-entrepreneurs.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ClubsService } from '../clubs/clubs.service';

@Controller('entrepreneurs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EntrepreneursController {
  constructor(
    private readonly entrepreneursService: EntrepreneursService,
    private readonly clubsService: ClubsService,
  ) {}

  @Roles('admin')
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateEntrepreneurDto) {
    return this.entrepreneursService.create(dto);
  }

  @Roles('entrepreneur')
  @Get('me')
  async getMe(@Request() req: any) {
    const entrepreneur = await this.entrepreneursService.findOne(req.user.id);
    const club = await this.clubsService.findClubByEntrepreneur(req.user.id);
    return {
      ...entrepreneur,
      managedClub: club ? {
        id: club.id,
        name: club.name,
        logoUrl: club.logoUrl,
        clubStatus: club.clubStatus,
        creationDate: club.creationDate,
      } : null,
      managedClubId: club ? club.id : null,
    };
  }

  @Roles('entrepreneur')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('me/verify-password')
  async verifyPassword(@Request() req: any, @Body() body: { password: string }) {
    return this.entrepreneursService.verifyPassword(req.user.id, body.password);
  }

  @Roles('entrepreneur')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('me/deactivate')
  async deactivateMe(@Request() req: any, @Body() body: { password: string }) {
    return this.entrepreneursService.deactivateSelf(req.user.id, body.password);
  }

  @Roles('entrepreneur')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Patch('me')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateMe(@Request() req: any, @Body() dto: UpdateEntrepreneurDto) {
    delete (dto as any).active;
    return this.entrepreneursService.update(req.user.id, dto, true);
  }

  @Roles('entrepreneur')
  @Get('me/club')
  async getMyClub(@Request() req: any) {
    const club = await this.clubsService.findClubByEntrepreneur(req.user.id);
    if (!club) return { message: 'No tenés un club asociado aún' };
    return club;
  }

  @Roles('admin')
  @Get()
  async findAll() {
    return this.entrepreneursService.findAll();
  }

  @Roles('entrepreneur', 'admin')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    if (req.user.role !== 'admin' && req.user.id !== id) {
      throw new ForbiddenException('No autorizado para ver este emprendedor');
    }
    return this.entrepreneursService.findOne(id);
  }

  @Roles('entrepreneur', 'admin')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEntrepreneurDto, @Request() req: any) {
    if (req.user.role !== 'admin') {
      if (req.user.id !== id) {
        throw new ForbiddenException('No autorizado para actualizar este emprendedor');
      }
      delete (dto as any).active;
    }
    return this.entrepreneursService.update(id, dto, req.user.role !== 'admin');
  }

  @Roles('admin')
  @Put(':id/deactivate')
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.entrepreneursService.deactivate(id);
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.entrepreneursService.remove(id);
  }
}
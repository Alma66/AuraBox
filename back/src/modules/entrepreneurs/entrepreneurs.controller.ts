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
  Patch,
} from '@nestjs/common';
import { EntrepreneursService } from './entrepreneurs.service';
import { CreateEntrepreneurDto } from './dto/create-entrepreneurs.dto';
import { UpdateEntrepreneurDto } from './dto/update-entrepreneurs.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ClubsService } from '../clubs/clubs.service';

@Controller('entrepreneurs')
@UseGuards(JwtAuthGuard)
export class EntrepreneursController {
  constructor(
    private readonly entrepreneursService: EntrepreneursService,
    private readonly clubsService: ClubsService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateEntrepreneurDto) {
    return this.entrepreneursService.create(dto);
  }

  @Get('me')
  async getMe(@Request() req: any) {
    const entrepreneur = await this.entrepreneursService.findOne(req.user.id);
    const club = await this.clubsService.findClubByEntrepreneur(req.user.id);
    return {
      ...entrepreneur,
      managedClub: club
        ? { id: club.id, name: club.name, logoUrl: club.logoUrl }
        : null,
      managedClubId: club ? club.id : null,
    };
  }

  @Post('me/verify-password')
  async verifyPassword(@Request() req: any, @Body() body: { password: string }) {
    return this.entrepreneursService.verifyPassword(req.user.id, body.password);
  }

  @Patch('me')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateMe(@Request() req: any, @Body() dto: UpdateEntrepreneurDto) {
    return this.entrepreneursService.update(req.user.id, dto);
  }

  // El emprendedor ve su propio club directamente
  @Get('me/club')
  async getMyClub(@Request() req: any) {
    const club = await this.clubsService.findClubByEntrepreneur(req.user.id);
    if (!club) {
      return { message: 'No tenés un club asociado aún' };
    }
    return club;
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  async findAll() {
    return this.entrepreneursService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    if (req.user.id !== id && req.user.role !== 'admin') {
      throw new ForbiddenException('No autorizado para ver este emprendedor');
    }
    return this.entrepreneursService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEntrepreneurDto,
    @Request() req: any,
  ) {
    if (req.user.id !== id && req.user.role !== 'admin') {
      throw new ForbiddenException('No autorizado para actualizar este emprendedor');
    }
    return this.entrepreneursService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Put(':id/deactivate')
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.entrepreneursService.deactivate(id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.entrepreneursService.remove(id);
  }
}
import {
  Body, Controller, Get, Post, Put, Delete,
  Param, ParseIntPipe, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { ClubStatusHistoryService } from './club-status-history.service';
import { CreateClubStatusHistoryDto } from './dto/create-club-status-history.dto';
import { UpdateClubStatusHistoryDto } from './dto/update-club-status-history.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('club-status-history')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ClubStatusHistoryController {
  constructor(private readonly svc: ClubStatusHistoryService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateClubStatusHistoryDto) {
    return this.svc.create(dto);
  }

  @Get()
  async findAll() {
    return this.svc.findAll();
  }

  @Get('by-club/:idClub')
  async findByClub(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.svc.findByClub(idClub);
  }

  @Get('by-admin/:idAdmin')
  async findByAdmin(@Param('idAdmin', ParseIntPipe) idAdmin: number) {
    return this.svc.findByAdmin(idAdmin);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClubStatusHistoryDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
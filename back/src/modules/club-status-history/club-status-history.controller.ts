import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ClubStatusHistoryService } from './club-status-history.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('club-status-history')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class ClubStatusHistoryController {
  constructor(private readonly svc: ClubStatusHistoryService) {}

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
}
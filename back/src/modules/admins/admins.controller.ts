import {
  Body, Controller, Get, Post, Put, Patch,
  Param, ParseIntPipe, UseGuards, UsePipes, ValidationPipe, Request,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { SetAdminActiveDto } from './dto/set-admin-active.dto';
import { SetAdminPasswordDto } from './dto/set-admin-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admins')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class AdminsController {
  constructor(private readonly svc: AdminsService) {}

  @Post()
  async create(@Body() dto: CreateAdminDto) {
    return this.svc.create(dto);
  }

  @Get()
  async findAll() {
    return this.svc.findAll();
  }

  @Get('by-email/:email')
  async findByEmail(@Param('email') email: string) {
    return this.svc.findByEmail(email);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAdminDto) {
    return this.svc.update(id, dto);
  }

  @Patch(':id/active')
  async setActive(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetAdminActiveDto,
    @Request() req,
  ) {
    return this.svc.setActive(id, dto.active, req.user.id);
  }

  @Patch(':id/password')
  async setPassword(@Param('id', ParseIntPipe) id: number, @Body() dto: SetAdminPasswordDto) {
    return this.svc.setPassword(id, dto.password);
  }
}
import {
  Body, Controller, Get, Post, Put, Delete,
  Param, ParseIntPipe, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admins')
@UseGuards(JwtAuthGuard)
export class AdminsController {
  constructor(private readonly svc: AdminsService) {}

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateAdminDto) {
    return this.svc.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.svc.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('by-email/:email')
  async findByEmail(@Param('email') email: string) {
    return this.svc.findByEmail(email);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAdminDto) {
    return this.svc.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
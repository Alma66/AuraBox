import {
  Body, Controller, Get, Post, Put, Delete,
  Param, ParseIntPipe, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { AdminOrEntrepreneurRoleService } from './admin-or-entrepreneur-role.service';
import { CreateAdminOrEntrepreneurRoleDto } from './dto/create-admin-or-entrepreneur-role.dto';
import { UpdateAdminOrEntrepreneurRoleDto } from './dto/update-admin-or-entrepreneur-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin-or-entrepreneur-role')
@UseGuards(JwtAuthGuard)
export class AdminOrEntrepreneurRoleController {
  constructor(private readonly svc: AdminOrEntrepreneurRoleService) {}

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateAdminOrEntrepreneurRoleDto) {
    return this.svc.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.svc.findAll();
  }

  @Get('by-assigned-to/:assignedTo')
  async findByAssignedTo(@Param('assignedTo', ParseIntPipe) assignedTo: number) {
    return this.svc.findByAssignedTo(assignedTo);
  }

  @Get('by-role/:idRole')
  async findByRole(@Param('idRole', ParseIntPipe) idRole: number) {
    return this.svc.findByRole(idRole);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAdminOrEntrepreneurRoleDto) {
    return this.svc.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
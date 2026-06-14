import {
  Body, Controller, Get, Post, Put, Delete,
  Param, ParseIntPipe, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { RolePermissionsService } from './role-permissions.service';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('role-permissions')
@UseGuards(JwtAuthGuard)
export class RolePermissionsController {
  constructor(private readonly svc: RolePermissionsService) {}

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateRolePermissionDto) {
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
  @Get('by-role/:idRole')
  async findByRole(@Param('idRole', ParseIntPipe) idRole: number) {
    return this.svc.findByRole(idRole);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('by-permission/:idPermission')
  async findByPermission(@Param('idPermission', ParseIntPipe) idPermission: number) {
    return this.svc.findByPermission(idPermission);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRolePermissionDto) {
    return this.svc.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
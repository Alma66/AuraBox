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

@Controller('entrepreneurs')
@UseGuards(JwtAuthGuard)
export class EntrepreneursController {
  constructor(private readonly entrepreneursService: EntrepreneursService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateEntrepreneurDto) {
    return this.entrepreneursService.create(dto);
  }

  // Endpoint que usa EntrepreneurProfilePage
  @Get('me')
  async getMe(@Request() req: any) {
    return this.entrepreneursService.findOne(req.user.id);
  }

  // Verifica contraseña para mostrar datos sensibles
  @Post('me/verify-password')
  async verifyPassword(@Request() req: any, @Body() body: { password: string }) {
    return this.entrepreneursService.verifyPassword(req.user.id, body.password);
  }

  @Patch('me')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateMe(@Request() req: any, @Body() dto: UpdateEntrepreneurDto) {
    return this.entrepreneursService.update(req.user.id, dto);
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
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEntrepreneurDto, @Request() req: any) {
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
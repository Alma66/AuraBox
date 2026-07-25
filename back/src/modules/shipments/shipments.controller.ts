import {
  Body, Controller, Get, Post, Put, Delete,
  Param, ParseIntPipe, UseGuards, Request,
  UsePipes, ValidationPipe, ForbiddenException,
} from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { AssignDeliveryDto, AssignNewShipmentDto } from './dto/assign-delivery.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('shipments')
@UseGuards(JwtAuthGuard)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateShipmentDto, @Request() req) {
    if (req.user.id !== dto.idUser && req.user.role !== 'admin') {
      throw new ForbiddenException('No autorizado para crear este envío');
    }
    return this.shipmentsService.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Post('assign')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async assignNew(@Body() dto: AssignNewShipmentDto, @Request() req) {
    await this.shipmentsService.assertClubAccess(dto.idClub, req.user);
    return this.shipmentsService.assignNewShipment(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.shipmentsService.findAll();
  }

  @Get('by-user/:idUser')
  async findByUser(@Param('idUser', ParseIntPipe) idUser: number, @Request() req) {
    if (req.user.id !== idUser && req.user.role !== 'admin') {
      throw new ForbiddenException('No autorizado para ver estos envíos');
    }
    return this.shipmentsService.findByUser(idUser);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Get('by-club/:idClub')
  async findByClub(@Param('idClub', ParseIntPipe) idClub: number, @Request() req) {
    await this.shipmentsService.assertClubAccess(idClub, req.user);
    return this.shipmentsService.findByClub(idClub);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Get('pending-by-club/:idClub')
  async findPendingByClub(@Param('idClub', ParseIntPipe) idClub: number, @Request() req) {
    await this.shipmentsService.assertClubAccess(idClub, req.user);
    return this.shipmentsService.getPendingForClub(idClub);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const shipment = await this.shipmentsService.findOne(id);
    if (req.user.role === 'admin') return shipment;
    if (req.user.role === 'customer' && req.user.id === shipment.idUser) return shipment;
    if (req.user.role === 'entrepreneur' && shipment.idClub) {
      await this.shipmentsService.assertClubAccess(shipment.idClub, req.user);
      return shipment;
    }
    throw new ForbiddenException('No autorizado para ver este envío');
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Put(':id/assign/:idClub')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async assignExisting(
    @Param('id', ParseIntPipe) id: number,
    @Param('idClub', ParseIntPipe) idClub: number,
    @Body() dto: AssignDeliveryDto,
    @Request() req,
  ) {
    await this.shipmentsService.assertClubAccess(idClub, req.user);
    return this.shipmentsService.assignRiderForClub(id, idClub, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateShipmentDto) {
    return this.shipmentsService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.remove(id);
  }
}
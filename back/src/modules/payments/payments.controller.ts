import {
  Body, Controller, Get, Post, Put, Delete,
  Param, ParseIntPipe, Query, UseGuards, Request,
  UsePipes, ValidationPipe, ForbiddenException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreatePaymentDto, @Request() req) {
    if (req.user.id !== dto.idUser && req.user.role !== 'admin') {
      throw new ForbiddenException('No autorizado para registrar este pago');
    }
    return this.paymentsService.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.paymentsService.findAll();
  }

  @Get('by-user/:idUser')
  async findByUser(@Param('idUser', ParseIntPipe) idUser: number, @Request() req) {
    if (req.user.id !== idUser && req.user.role !== 'admin') {
      throw new ForbiddenException('No autorizado para ver estos pagos');
    }
    return this.paymentsService.findByUser(idUser);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Get('by-club/:idClub')
  async findByClub(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.paymentsService.findByClub(idClub);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePaymentDto) {
    return this.paymentsService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.remove(id);
  }
}
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
} from '@nestjs/common';
import { TransactionHistoryService } from './transaction-history.service';
import { CreateTransactionHistoryDto } from './dto/create-transaction-history.dto';
import { UpdateTransactionHistoryDto } from './dto/update-transaction-history.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('transaction-history')
@UseGuards(JwtAuthGuard)
export class TransactionHistoryController {
  constructor(private readonly svc: TransactionHistoryService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateTransactionHistoryDto, @Request() req) {
    if (req.user.id !== dto.idUser && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('No autorizado para registrar esta transacción');
    }
    return this.svc.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  async findAll() {
    return this.svc.findAll();
  }

  @Get('by-user/:idUser')
  async findByUser(@Param('idUser', ParseIntPipe) idUser: number, @Request() req) {
    if (req.user.id !== idUser && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('No autorizado para ver estas transacciones');
    }
    return this.svc.findByUser(idUser);
  }

  @Get('by-subscription/:idUserSubscriptions')
  async findBySubscription(@Param('idUserSubscriptions', ParseIntPipe) idUserSubscriptions: number) {
    return this.svc.findBySubscription(idUserSubscriptions);
  }

  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Get('by-club/:idClub')
  async findByClub(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.svc.findByClub(idClub);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTransactionHistoryDto) {
    return this.svc.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
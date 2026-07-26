import {
  Body, Controller, Get, Post, Put, Delete,
  Param, ParseIntPipe, UseGuards, Request,
  UsePipes, ValidationPipe,
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

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateTransactionHistoryDto) {
    return this.svc.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.svc.findAll();
  }

  @Get('by-user/:idUser')
  async findByUser(@Param('idUser', ParseIntPipe) idUser: number, @Request() req) {
    return this.svc.findByUser(idUser, req.user);
  }

  @Get('by-subscription/:idUserSubscriptions')
  async findBySubscription(@Param('idUserSubscriptions', ParseIntPipe) idUserSubscriptions: number, @Request() req) {
    return this.svc.findBySubscription(idUserSubscriptions, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Get('by-club/:idClub')
  async findByClub(@Param('idClub', ParseIntPipe) idClub: number, @Request() req) {
    return this.svc.findByClub(idClub, req.user);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.svc.findOne(id, req.user);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTransactionHistoryDto) {
    return this.svc.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
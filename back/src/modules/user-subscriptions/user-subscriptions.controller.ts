import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, UseGuards, Request, UsePipes, ValidationPipe,
  Query, ForbiddenException,
} from '@nestjs/common';
import { UserSubscriptionsService } from './user-subscriptions.service';
import { CreateUserSubscriptionDto } from './dto/create-user-subscription.dto';
import { UpdateUserSubscriptionDto } from './dto/update-user-subscription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('user-subscriptions')
@UseGuards(JwtAuthGuard)
export class UserSubscriptionsController {
  constructor(private readonly svc: UserSubscriptionsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateUserSubscriptionDto, @Request() req) {
    return this.svc.create(dto, req.user?.id);
  }

  @Get()
  async findAll(@Query('userId') userId?: string) {
    if (userId) return this.svc.findByUser(Number(userId));
    return this.svc.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findById(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin', 'entrepreneur')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserSubscriptionDto, @Request() req) {
    return this.svc.update(id, dto, req.user?.role);
  }

  @Post(':id/cancel')
  async cancel(@Param('id', ParseIntPipe) id: number, @Body() body: { reason?: string }, @Request() req) {
    const sub = await this.svc.findById(id);
    if (req.user?.id !== sub.idUser && req.user?.role !== 'admin') {
      throw new ForbiddenException('No autorizado para cancelar esta suscripción');
    }
    return this.svc.cancel(id, body?.reason);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, UseGuards, Request, UsePipes, ValidationPipe, Query,
} from '@nestjs/common';
import { SubscriptionTypesService } from './subscription-types.service';
import { CreateSubscriptionTypeDto } from './dto/create-subscription-types.dto';
import { UpdateSubscriptionTypeDto } from './dto/update-subscription-types.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('subscription-types')
@UseGuards(JwtAuthGuard)
export class SubscriptionTypesController {
  constructor(private readonly svc: SubscriptionTypesService) {}

  @Get()
  async findAll(@Query('clubId') clubId?: string) {
    if (clubId) return this.svc.findByClub(Number(clubId));
    return this.svc.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findById(id);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateSubscriptionTypeDto, @Request() req) {
    return this.svc.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSubscriptionTypeDto, @Request() req) {
    return this.svc.update(id, dto, req.user?.role);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
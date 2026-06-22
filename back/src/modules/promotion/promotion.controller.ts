import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Patch, Post, Put, UseGuards, Request, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('promotions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('entrepreneur', 'admin')
export class PromotionController {
  constructor(private readonly svc: PromotionService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreatePromotionDto, @Request() req) {
    return this.svc.create(dto, req.user?.id);
  }

  @Get('by-club/:idClub')
  async findByClub(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.svc.findByClub(idClub);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePromotionDto) {
    return this.svc.update(id, dto);
  }

  @Patch(':id/toggle')
  async toggle(@Param('id', ParseIntPipe) id: number, @Body() body: { active: boolean }) {
    return this.svc.toggleActive(id, body.active);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
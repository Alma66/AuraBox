import {
  Body, Controller, Get, Post, Put, Delete,
  Param, ParseIntPipe, UseGuards, Request, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { PlatformRulesService } from './platform-rules.service';
import { CreatePlatformRuleDto } from './dto/create-platform-rule.dto';
import { UpdatePlatformRuleDto } from './dto/update-platform-rule.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('platform-rules')
@UseGuards(JwtAuthGuard)
export class PlatformRulesController {
  constructor(private readonly svc: PlatformRulesService) {}

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreatePlatformRuleDto) {
    return this.svc.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.svc.findAll();
  }

  @Get('active')
  async findActive() {
    return this.svc.findActive();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlatformRuleDto) {
    return this.svc.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
import {
  Body, Controller, Get, Post, Put, Patch, Delete,
  Param, ParseIntPipe, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { PlatformRulesService } from './platform-rules.service';
import { CreatePlatformRuleDto } from './dto/create-platform-rule.dto';
import { UpdatePlatformRuleDto } from './dto/update-platform-rule.dto';
import { SetRuleActiveDto } from './dto/set-rule-active.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('platform-rules')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class PlatformRulesController {
  constructor(private readonly svc: PlatformRulesService) {}

  @Public()
  @Get('active')
  async findActive() {
    return this.svc.findActive();
  }

  @Roles('admin')
  @Post()
  async create(@Body() dto: CreatePlatformRuleDto) {
    return this.svc.create(dto);
  }

  @Roles('admin')
  @Get()
  async findAll() {
    return this.svc.findAll();
  }

  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Roles('admin')
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePlatformRuleDto) {
    return this.svc.update(id, dto);
  }

  @Roles('admin')
  @Patch(':id/active')
  async setActive(@Param('id', ParseIntPipe) id: number, @Body() dto: SetRuleActiveDto) {
    return this.svc.setActive(id, dto.active);
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
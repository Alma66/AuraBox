import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Request, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateFinancialEntryDto } from './dto/create-financial-entry.dto';
import { UpdateFinancialEntryDto } from './dto/update-financial-entry.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('entrepreneur', 'admin')
export class FinanceController {
  constructor(private readonly svc: FinanceService) {}

  @Get('movements/by-club/:idClub')
  async getMovements(@Param('idClub', ParseIntPipe) idClub: number, @Request() req) {
    await this.svc.assertClubAccess(idClub, req.user);
    return this.svc.getMovements(idClub);
  }

  @Get('profitability/by-club/:idClub')
  async getProfitability(@Param('idClub', ParseIntPipe) idClub: number, @Request() req) {
    await this.svc.assertClubAccess(idClub, req.user);
    return this.svc.getProfitability(idClub);
  }

  @Post('entries')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createEntry(@Body() dto: CreateFinancialEntryDto, @Request() req) {
    await this.svc.assertClubAccess(dto.idClub, req.user);
    return this.svc.createEntry(dto);
  }

  @Put('entries/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateEntry(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFinancialEntryDto, @Request() req) {
    await this.svc.assertEntryAccess(id, req.user);
    return this.svc.updateEntry(id, dto);
  }

  @Delete('entries/:id')
  async removeEntry(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.svc.assertEntryAccess(id, req.user);
    return this.svc.removeEntry(id);
  }
}
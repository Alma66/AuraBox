import {
  Body, Controller, Get, Param, ParseIntPipe, Put,
  Request, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ClubBillingService } from './club-billing.service';
import { UpdateClubBillingDto } from './dto/update-club-billing.dto';

@Controller('clubs/:id/billing')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('entrepreneur', 'admin')
export class ClubBillingController {
  constructor(private readonly service: ClubBillingService) {}

  @Get()
  async get(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.service.get(id, req.user);
  }

  @Put()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateClubBillingDto, @Request() req: any) {
    return this.service.update(id, dto, req.user);
  }
}
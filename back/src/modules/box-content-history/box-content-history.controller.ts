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
  Query,
} from '@nestjs/common';
import { BoxContentHistoryService } from './box-content-history.service';
import { CreateBoxContentHistoryDto } from './dto/create-box-content-history.dto';
import { UpdateBoxContentHistoryDto } from './dto/update-box-content-history.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('box-content-history')
@UseGuards(JwtAuthGuard) 
export class BoxContentHistoryController {
  constructor(private readonly svc: BoxContentHistoryService) {}

  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateBoxContentHistoryDto, @Request() req) {
    return this.svc.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Get()
  async findAll(@Query('page') page?: string, @Query('perPage') perPage?: string) {
    const p = page ? parseInt(page, 10) : 1;
    const pp = perPage ? parseInt(perPage, 10) : 50;
    return this.svc.findAll(p, pp);
  }

  @Get('by-subscription-type/:idSubscriptionTypes')
  async findBySubscriptionType(@Param('idSubscriptionTypes', ParseIntPipe) idSubscriptionTypes: number) {
    return this.svc.findBySubscriptionType(idSubscriptionTypes);
  }

  @Get('by-delivery-month/:deliveryMonthYear')
  async findByDeliveryMonth(@Param('deliveryMonthYear') deliveryMonthYear: string) {
    return this.svc.findByDeliveryMonth(deliveryMonthYear);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Put(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBoxContentHistoryDto, @Request() req) {
    return this.svc.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.svc.remove(id);
  }
}
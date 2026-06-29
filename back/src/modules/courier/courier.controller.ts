import { Body, Controller, Get, Param, ParseIntPipe, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CourierService } from './courier.service';
import { SetClubCouriersDto } from './dto/set-club-couriers.dto';
import { SetCourierFeeDto } from './dto/set-courier-fee.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('courier')
@UseGuards(JwtAuthGuard)
export class CourierController {
  constructor(private readonly svc: CourierService) {}

  @Get()
  async findAll() {
    return this.svc.findAll();
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Get('by-club/:idClub')
  async findByClub(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.svc.findByClub(idClub);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Put('by-club/:idClub')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async setClubCouriers(@Param('idClub', ParseIntPipe) idClub: number, @Body() dto: SetClubCouriersDto) {
    return this.svc.setClubCouriers(idClub, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('entrepreneur', 'admin')
  @Put('by-club/:idClub/fee/:idCourier')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async setCourierFee(
    @Param('idClub', ParseIntPipe) idClub: number,
    @Param('idCourier', ParseIntPipe) idCourier: number,
    @Body() dto: SetCourierFeeDto,
  ) {
    return this.svc.setCourierFee(idClub, idCourier, dto);
  }
}
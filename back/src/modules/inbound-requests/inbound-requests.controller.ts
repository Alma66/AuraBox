import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InboundRequestsService } from './inbound-requests.service';
import { ListInboundRequestsDto, UpdateInboundStatusDto } from './dto/inbound-request.dto';

@Controller('inbound-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class InboundRequestsController {
  constructor(private readonly service: InboundRequestsService) {}

  @Get()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async findAll(@Query() query: ListInboundRequestsDto) {
    return this.service.findAll(query.type, query.status);
  }

  @Patch(':id/status')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateInboundStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }
}
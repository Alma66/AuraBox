import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ConfirmMercadoPagoDto } from './dto/confirm-mercadopago.dto';
import { MercadoPagoService } from './mercadopago.service';

const ORDER_ID = /^[A-Za-z0-9]{10,64}$/;

@Controller('mercadopago')
@UseGuards(JwtAuthGuard)
export class MercadoPagoController {
  constructor(private readonly mercadoPagoService: MercadoPagoService) {}

  @Public()
  @SkipThrottle()
  @Post('webhook')
  @HttpCode(200)
  async webhook(@Body() body: any, @Query() query: any) {
    const type = String(body?.type ?? query?.type ?? query?.topic ?? '');
    if (type && type !== 'order') return { received: true };
    const raw = body?.data?.id ?? query?.['data.id'] ?? query?.id;
    const orderId = raw === undefined || raw === null ? '' : String(raw);
    if (!ORDER_ID.test(orderId)) return { received: true };
    await this.mercadoPagoService.handleWebhook(orderId);
    return { received: true };
  }

  @UseGuards(RolesGuard)
  @Roles('customer')
  @Post('confirm')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async confirm(@Body() dto: ConfirmMercadoPagoDto, @Request() req) {
    return this.mercadoPagoService.confirmForUser(req.user.id, dto.ref);
  }

  @UseGuards(RolesGuard)
  @Roles('customer')
  @Get('status/:ref')
  async status(@Param('ref') ref: string, @Request() req) {
    return this.mercadoPagoService.statusForUser(req.user.id, ref);
  }
}
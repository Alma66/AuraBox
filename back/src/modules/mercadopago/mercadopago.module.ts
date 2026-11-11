import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { MercadoPagoController } from './mercadopago.controller';
import { MercadoPagoService } from './mercadopago.service';

@Module({
  imports: [NotificationsModule],
  controllers: [MercadoPagoController],
  providers: [MercadoPagoService],
  exports: [MercadoPagoService],
})
export class MercadoPagoModule {}
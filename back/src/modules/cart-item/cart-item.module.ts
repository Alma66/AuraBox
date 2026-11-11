import { Module } from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { CartItemController } from './cart-item.controller';
import { MercadoPagoModule } from '../mercadopago/mercadopago.module';

@Module({
  imports: [MercadoPagoModule],
  controllers: [CartItemController],
  providers: [CartItemService],
})
export class CartItemModule {}
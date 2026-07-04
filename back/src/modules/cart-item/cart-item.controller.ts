import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, UseGuards, Request, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { CheckoutCartDto } from './dto/checkout-cart.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('cart-items')
@UseGuards(JwtAuthGuard)
export class CartItemController {
  constructor(private readonly cartItemService: CartItemService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async addToCart(@Body() dto: CreateCartItemDto, @Request() req) {
    return this.cartItemService.addToCart(req.user.id, dto);
  }

  @Get()
  async findMine(@Request() req) {
    return this.cartItemService.findByUserEnriched(req.user.id);
  }

  @Post('checkout')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async checkout(@Body() dto: CheckoutCartDto, @Request() req) {
    return this.cartItemService.checkout(req.user.id, dto);
  }

  @Delete(':idSubscriptionTypes')
  async remove(@Param('idSubscriptionTypes', ParseIntPipe) idSubscriptionTypes: number, @Request() req) {
    return this.cartItemService.remove(req.user.id, idSubscriptionTypes);
  }

  @Delete()
  async clear(@Request() req) {
    return this.cartItemService.clear(req.user.id);
  }
}
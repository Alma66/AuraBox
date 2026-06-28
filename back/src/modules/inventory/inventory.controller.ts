import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, UseGuards, UsePipes, ValidationPipe,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateSupplyCategoryDto } from './dto/create-supply-category.dto';
import { UpdateSupplyCategoryDto } from './dto/update-supply-category.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { CreateProductInventoryDto } from './dto/create-product-inventory.dto';
import { UpdateProductInventoryDto } from './dto/update-product-inventory.dto';
import { CreateSupplyOrderDto } from './dto/create-supply-order.dto';
import { UpdateSupplyOrderDto } from './dto/update-supply-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('entrepreneur', 'admin')
export class InventoryController {
  constructor(private readonly svc: InventoryService) {}

  @Post('categories')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createCategory(@Body() dto: CreateSupplyCategoryDto) {
    return this.svc.createCategory(dto);
  }

  @Get('categories/by-club/:idClub')
  async findCategories(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.svc.findCategoriesByClub(idClub);
  }

  @Put('categories/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSupplyCategoryDto) {
    return this.svc.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  async removeCategory(@Param('id', ParseIntPipe) id: number) {
    return this.svc.removeCategory(id);
  }

  @Post('suppliers')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createSupplier(@Body() dto: CreateSupplierDto) {
    return this.svc.createSupplier(dto);
  }

  @Get('suppliers/by-club/:idClub')
  async findSuppliers(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.svc.findSuppliersByClub(idClub);
  }

  @Put('suppliers/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateSupplier(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSupplierDto) {
    return this.svc.updateSupplier(id, dto);
  }

  @Delete('suppliers/:id')
  async removeSupplier(@Param('id', ParseIntPipe) id: number) {
    return this.svc.removeSupplier(id);
  }

  @Post('products')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createProduct(@Body() dto: CreateProductInventoryDto) {
    return this.svc.createProduct(dto);
  }

  @Get('products/by-club/:idClub')
  async findProducts(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.svc.findProductsByClub(idClub);
  }

  @Put('products/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateProduct(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductInventoryDto) {
    return this.svc.updateProduct(id, dto);
  }

  @Delete('products/:id')
  async removeProduct(@Param('id', ParseIntPipe) id: number) {
    return this.svc.removeProduct(id);
  }

  @Post('orders')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createOrder(@Body() dto: CreateSupplyOrderDto) {
    return this.svc.createOrder(dto);
  }

  @Get('orders/by-club/:idClub')
  async findOrders(@Param('idClub', ParseIntPipe) idClub: number) {
    return this.svc.findOrdersByClub(idClub);
  }

  @Put('orders/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateOrder(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSupplyOrderDto) {
    return this.svc.updateOrder(id, dto);
  }

  @Delete('orders/:id')
  async removeOrder(@Param('id', ParseIntPipe) id: number) {
    return this.svc.removeOrder(id);
  }
}
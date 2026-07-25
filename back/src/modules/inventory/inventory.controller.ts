import {
  Body, Controller, Delete, Get, Param, ParseIntPipe,
  Post, Put, Request, UseGuards, UsePipes, ValidationPipe,
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
  async createCategory(@Body() dto: CreateSupplyCategoryDto, @Request() req) {
    return this.svc.createCategory(dto, req.user);
  }

  @Get('categories/by-club/:idClub')
  async findCategories(@Param('idClub', ParseIntPipe) idClub: number, @Request() req) {
    return this.svc.findCategoriesByClub(idClub, req.user);
  }

  @Put('categories/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateCategory(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSupplyCategoryDto, @Request() req) {
    return this.svc.updateCategory(id, dto, req.user);
  }

  @Delete('categories/:id')
  async removeCategory(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.svc.removeCategory(id, req.user);
  }

  @Post('suppliers')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createSupplier(@Body() dto: CreateSupplierDto, @Request() req) {
    return this.svc.createSupplier(dto, req.user);
  }

  @Get('suppliers/by-club/:idClub')
  async findSuppliers(@Param('idClub', ParseIntPipe) idClub: number, @Request() req) {
    return this.svc.findSuppliersByClub(idClub, req.user);
  }

  @Put('suppliers/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateSupplier(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSupplierDto, @Request() req) {
    return this.svc.updateSupplier(id, dto, req.user);
  }

  @Delete('suppliers/:id')
  async removeSupplier(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.svc.removeSupplier(id, req.user);
  }

  @Post('products')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createProduct(@Body() dto: CreateProductInventoryDto, @Request() req) {
    return this.svc.createProduct(dto, req.user);
  }

  @Get('products/by-club/:idClub')
  async findProducts(@Param('idClub', ParseIntPipe) idClub: number, @Request() req) {
    return this.svc.findProductsByClub(idClub, req.user);
  }

  @Put('products/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateProduct(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductInventoryDto, @Request() req) {
    return this.svc.updateProduct(id, dto, req.user);
  }

  @Delete('products/:id')
  async removeProduct(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.svc.removeProduct(id, req.user);
  }

  @Post('orders')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createOrder(@Body() dto: CreateSupplyOrderDto, @Request() req) {
    return this.svc.createOrder(dto, req.user);
  }

  @Get('orders/by-club/:idClub')
  async findOrders(@Param('idClub', ParseIntPipe) idClub: number, @Request() req) {
    return this.svc.findOrdersByClub(idClub, req.user);
  }

  @Put('orders/:id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateOrder(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSupplyOrderDto, @Request() req) {
    return this.svc.updateOrder(id, dto, req.user);
  }

  @Delete('orders/:id')
  async removeOrder(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.svc.removeOrder(id, req.user);
  }
}
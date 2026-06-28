import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupplyCategoryDto } from './dto/create-supply-category.dto';
import { UpdateSupplyCategoryDto } from './dto/update-supply-category.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { CreateProductInventoryDto } from './dto/create-product-inventory.dto';
import { UpdateProductInventoryDto } from './dto/update-product-inventory.dto';
import { CreateSupplyOrderDto } from './dto/create-supply-order.dto';
import { UpdateSupplyOrderDto } from './dto/update-supply-order.dto';

function sanitizeDecimal(obj: any, fields: string[]) {
  if (!obj) return obj;
  fields.forEach((f) => {
    if (obj[f] !== undefined && obj[f] !== null) {
      try {
        obj[f] = obj[f].toString();
      } catch {}
    }
  });
  return obj;
}

function sanitizeDates(obj: any, fields: string[]) {
  if (!obj) return obj;
  fields.forEach((f) => {
    if (obj[f] instanceof Date) obj[f] = obj[f].toISOString();
  });
  return obj;
}

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(dto: CreateSupplyCategoryDto) {
    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');
    return this.prisma.supply_Category.create({ data: dto });
  }

  async findCategoriesByClub(idClub: number) {
    return this.prisma.supply_Category.findMany({ where: { idClub }, orderBy: { name: 'asc' } });
  }

  async updateCategory(id: number, dto: UpdateSupplyCategoryDto) {
    const cat = await this.prisma.supply_Category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    return this.prisma.supply_Category.update({ where: { id }, data: dto });
  }

  async removeCategory(id: number) {
    const cat = await this.prisma.supply_Category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    const inUse = await this.prisma.product_Inventory.findFirst({ where: { idSupplyCategory: id } });
    if (inUse) throw new BadRequestException('No se puede eliminar: hay productos usando esta categoría');
    await this.prisma.supply_Category.delete({ where: { id } });
    return { message: 'Categoría eliminada correctamente' };
  }

  async createSupplier(dto: CreateSupplierDto) {
    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');

    const created = await this.prisma.supplier.create({
      data: {
        idClub: dto.idClub,
        name: dto.name,
        contactEmail: dto.contactEmail ?? null,
        contactPhone: dto.contactPhone ?? null,
        address: dto.address ?? null,
        notes: dto.notes ?? null,
        active: dto.active ?? true,
      },
    });

    if (dto.categoryIds && dto.categoryIds.length > 0) {
      await this.prisma.supplier_Category.createMany({
        data: dto.categoryIds.map((idSupplyCategory) => ({ idSupplier: created.id, idSupplyCategory })),
        skipDuplicates: true,
      });
    }

    return this.findSupplierById(created.id);
  }

  async findSuppliersByClub(idClub: number) {
    const suppliers = await this.prisma.supplier.findMany({ where: { idClub }, orderBy: { name: 'asc' } });
    const links = await this.prisma.supplier_Category.findMany({
      where: { idSupplier: { in: suppliers.map((s) => s.id) } },
    });
    return suppliers.map((s) => ({
      ...s,
      categoryIds: links.filter((l) => l.idSupplier === s.id).map((l) => l.idSupplyCategory),
    }));
  }

  async findSupplierById(id: number) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Proveedor no encontrado');
    const links = await this.prisma.supplier_Category.findMany({ where: { idSupplier: id } });
    return { ...supplier, categoryIds: links.map((l) => l.idSupplyCategory) };
  }

  async updateSupplier(id: number, dto: UpdateSupplierDto) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Proveedor no encontrado');

    const { categoryIds, ...rest } = dto;
    await this.prisma.supplier.update({ where: { id }, data: rest });

    if (categoryIds !== undefined) {
      await this.prisma.supplier_Category.deleteMany({ where: { idSupplier: id } });
      if (categoryIds.length > 0) {
        await this.prisma.supplier_Category.createMany({
          data: categoryIds.map((idSupplyCategory) => ({ idSupplier: id, idSupplyCategory })),
          skipDuplicates: true,
        });
      }
    }

    return this.findSupplierById(id);
  }

  async removeSupplier(id: number) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Proveedor no encontrado');
    await this.prisma.supplier_Category.deleteMany({ where: { idSupplier: id } });
    await this.prisma.supplier.delete({ where: { id } });
    return { message: 'Proveedor eliminado correctamente' };
  }

  async createProduct(dto: CreateProductInventoryDto) {
    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');

    const category = await this.prisma.supply_Category.findUnique({ where: { id: dto.idSupplyCategory } });
    if (!category) throw new NotFoundException('Categoría no encontrada');

    if (dto.idSupplier) {
      const supplier = await this.prisma.supplier.findUnique({ where: { id: dto.idSupplier } });
      if (!supplier) throw new NotFoundException('Proveedor no encontrado');
    }

    const created = await this.prisma.product_Inventory.create({
      data: {
        idClub: dto.idClub,
        idSupplyCategory: dto.idSupplyCategory,
        idSupplier: dto.idSupplier ?? null,
        name: dto.name,
        description: dto.description ?? null,
        unitType: dto.unitType,
        currentStock: dto.currentStock ?? 0,
        minStock: dto.minStock ?? 0,
        costPerUnit: dto.costPerUnit ?? 0,
        active: dto.active ?? true,
      },
    });
    return sanitizeDecimal(sanitizeDates(created, ['createdAt']), ['currentStock', 'minStock', 'costPerUnit']);
  }

  async findProductsByClub(idClub: number) {
    const products = await this.prisma.product_Inventory.findMany({ where: { idClub }, orderBy: { name: 'asc' } });
    return products.map((p) => sanitizeDecimal(sanitizeDates(p, ['createdAt']), ['currentStock', 'minStock', 'costPerUnit']));
  }

  async updateProduct(id: number, dto: UpdateProductInventoryDto) {
    const product = await this.prisma.product_Inventory.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    const updated = await this.prisma.product_Inventory.update({ where: { id }, data: dto as any });
    return sanitizeDecimal(sanitizeDates(updated, ['createdAt']), ['currentStock', 'minStock', 'costPerUnit']);
  }

  async removeProduct(id: number) {
    const product = await this.prisma.product_Inventory.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    const inUse = await this.prisma.supply_Order.findFirst({ where: { idProductInventory: id } });
    if (inUse) throw new BadRequestException('No se puede eliminar: hay pedidos asociados a este producto');
    await this.prisma.product_Inventory.delete({ where: { id } });
    return { message: 'Producto eliminado correctamente' };
  }

  async createOrder(dto: CreateSupplyOrderDto) {
    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');

    const supplier = await this.prisma.supplier.findUnique({ where: { id: dto.idSupplier } });
    if (!supplier) throw new NotFoundException('Proveedor no encontrado');

    const product = await this.prisma.product_Inventory.findUnique({ where: { id: dto.idProductInventory } });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const created = await this.prisma.supply_Order.create({
      data: {
        idClub: dto.idClub,
        idSupplier: dto.idSupplier,
        idProductInventory: dto.idProductInventory,
        quantity: dto.quantity,
        totalCost: dto.totalCost,
        status: dto.status ?? 'Pendiente',
        estimatedArrival: dto.estimatedArrival ? new Date(dto.estimatedArrival) : null,
        notes: dto.notes ?? null,
      },
    });
    return sanitizeDecimal(sanitizeDates(created, ['orderDate', 'estimatedArrival', 'receivedDate']), ['quantity', 'totalCost']);
  }

  async findOrdersByClub(idClub: number) {
    const orders = await this.prisma.supply_Order.findMany({ where: { idClub }, orderBy: { orderDate: 'desc' } });
    return orders.map((o) => sanitizeDecimal(sanitizeDates(o, ['orderDate', 'estimatedArrival', 'receivedDate']), ['quantity', 'totalCost']));
  }

  async updateOrder(id: number, dto: UpdateSupplyOrderDto) {
    const order = await this.prisma.supply_Order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Pedido no encontrado');

    const data: any = { ...dto };
    if (dto.estimatedArrival !== undefined) data.estimatedArrival = dto.estimatedArrival ? new Date(dto.estimatedArrival) : null;
    if (dto.receivedDate !== undefined) data.receivedDate = dto.receivedDate ? new Date(dto.receivedDate) : null;

    if (dto.status === 'Recibido' && order.status !== 'Recibido') {
      data.receivedDate = data.receivedDate ?? new Date();
      await this.prisma.product_Inventory.update({
        where: { id: order.idProductInventory },
        data: { currentStock: { increment: Number(order.quantity) } },
      });
    }

    const updated = await this.prisma.supply_Order.update({ where: { id }, data });
    return sanitizeDecimal(sanitizeDates(updated, ['orderDate', 'estimatedArrival', 'receivedDate']), ['quantity', 'totalCost']);
  }

  async removeOrder(id: number) {
    const order = await this.prisma.supply_Order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    await this.prisma.supply_Order.delete({ where: { id } });
    return { message: 'Pedido eliminado correctamente' };
  }
}
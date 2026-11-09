import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupplyCategoryDto } from './dto/create-supply-category.dto';
import { UpdateSupplyCategoryDto } from './dto/update-supply-category.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { CreateProductInventoryDto } from './dto/create-product-inventory.dto';
import { UpdateProductInventoryDto } from './dto/update-product-inventory.dto';
import { CreateSupplyOrderDto } from './dto/create-supply-order.dto';
import { UpdateSupplyOrderDto } from './dto/update-supply-order.dto';

type RequestUser = { id: number; role: string };

function sanitizeDecimal(obj: any, fields: string[]) {
  if (!obj) return obj;
  fields.forEach((f) => {
    if (obj[f] !== undefined && obj[f] !== null) {
      try { obj[f] = obj[f].toString(); } catch {}
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

  private async assertClubAccess(idClub: number, user: RequestUser) {
    if (user.role === 'admin') return;
    const assoc = await this.prisma.entrepreneur_Club.findFirst({
      where: { idClub, idEntrepreneurs: user.id },
    });
    if (!assoc) throw new ForbiddenException('No tenés acceso a este club');
  }

  private async assertCategoriesInClub(ids: number[], idClub: number) {
    const unique = Array.from(new Set(ids));
    if (unique.length === 0) return unique;
    const found = await this.prisma.supply_Category.count({ where: { id: { in: unique }, idClub } });
    if (found !== unique.length) throw new BadRequestException('Alguna categoría no pertenece a este club');
    return unique;
  }
  async createCategory(dto: CreateSupplyCategoryDto, user: RequestUser) {
    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');
    await this.assertClubAccess(dto.idClub, user);
    return this.prisma.supply_Category.create({ data: dto });
  }

  async findCategoriesByClub(idClub: number, user: RequestUser) {
    await this.assertClubAccess(idClub, user);
    return this.prisma.supply_Category.findMany({ where: { idClub }, orderBy: { name: 'asc' } });
  }

  async updateCategory(id: number, dto: UpdateSupplyCategoryDto, user: RequestUser) {
    const cat = await this.prisma.supply_Category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    await this.assertClubAccess(cat.idClub, user);
    const { idClub, ...rest } = dto as any;
    return this.prisma.supply_Category.update({ where: { id }, data: rest });
  }

  async removeCategory(id: number, user: RequestUser) {
    const cat = await this.prisma.supply_Category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    await this.assertClubAccess(cat.idClub, user);
    const inUse = await this.prisma.product_Inventory.findFirst({ where: { idSupplyCategory: id } });
    if (inUse) throw new BadRequestException('No se puede eliminar: hay productos usando esta categoría');
    await this.prisma.supply_Category.delete({ where: { id } });
    return { message: 'Categoría eliminada correctamente' };
  }

   async createSupplier(dto: CreateSupplierDto, user: RequestUser) {
    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');
    await this.assertClubAccess(dto.idClub, user);
    const categoryIds = await this.assertCategoriesInClub(dto.categoryIds ?? [], dto.idClub);

    const created = await this.prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.create({
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
      if (categoryIds.length > 0) {
        await tx.supplier_Category.createMany({
          data: categoryIds.map((idSupplyCategory) => ({ idSupplier: supplier.id, idSupplyCategory })),
          skipDuplicates: true,
        });
      }
      return supplier;
    });

    return this.findSupplierById(created.id);
  }

  async findSuppliersByClub(idClub: number, user: RequestUser) {
    await this.assertClubAccess(idClub, user);
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

  async updateSupplier(id: number, dto: UpdateSupplierDto, user: RequestUser) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Proveedor no encontrado');
    await this.assertClubAccess(supplier.idClub, user);

    const { categoryIds, idClub, ...rest } = dto as any;
    const validIds = categoryIds !== undefined ? await this.assertCategoriesInClub(categoryIds, supplier.idClub) : null;

    await this.prisma.$transaction(async (tx) => {
      await tx.supplier.update({ where: { id }, data: rest });
      if (validIds) {
        await tx.supplier_Category.deleteMany({ where: { idSupplier: id } });
        if (validIds.length > 0) {
          await tx.supplier_Category.createMany({
            data: validIds.map((idSupplyCategory) => ({ idSupplier: id, idSupplyCategory })),
            skipDuplicates: true,
          });
        }
      }
    });

    return this.findSupplierById(id);
  }

  async removeSupplier(id: number, user: RequestUser) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Proveedor no encontrado');
    await this.assertClubAccess(supplier.idClub, user);
    await this.prisma.supplier_Category.deleteMany({ where: { idSupplier: id } });
    await this.prisma.supplier.delete({ where: { id } });
    return { message: 'Proveedor eliminado correctamente' };
  }

  async createProduct(dto: CreateProductInventoryDto, user: RequestUser) {
    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');
    await this.assertClubAccess(dto.idClub, user);

    const category = await this.prisma.supply_Category.findUnique({ where: { id: dto.idSupplyCategory } });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    if (category.idClub !== dto.idClub) throw new BadRequestException('La categoría no pertenece a este club');

    if (dto.idSupplier) {
      const supplier = await this.prisma.supplier.findUnique({ where: { id: dto.idSupplier } });
      if (!supplier) throw new NotFoundException('Proveedor no encontrado');
      if (supplier.idClub !== dto.idClub) throw new BadRequestException('El proveedor no pertenece a este club');
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

  async findProductsByClub(idClub: number, user: RequestUser) {
    await this.assertClubAccess(idClub, user);
    const products = await this.prisma.product_Inventory.findMany({ where: { idClub }, orderBy: { name: 'asc' } });
    return products.map((p) => sanitizeDecimal(sanitizeDates(p, ['createdAt']), ['currentStock', 'minStock', 'costPerUnit']));
  }

  async updateProduct(id: number, dto: UpdateProductInventoryDto, user: RequestUser) {
    const product = await this.prisma.product_Inventory.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    await this.assertClubAccess(product.idClub, user);

    const { idClub, idSupplyCategory, idSupplier, ...rest } = dto as any;
    const data: any = { ...rest };

    if (idSupplyCategory !== undefined && idSupplyCategory !== null) {
      const category = await this.prisma.supply_Category.findUnique({ where: { id: idSupplyCategory } });
      if (!category) throw new NotFoundException('Categoría no encontrada');
      if (category.idClub !== product.idClub) throw new BadRequestException('La categoría no pertenece a este club');
      data.idSupplyCategory = idSupplyCategory;
    }

    if (idSupplier !== undefined) {
      if (idSupplier === null) {
        data.idSupplier = null;
      } else {
        const supplier = await this.prisma.supplier.findUnique({ where: { id: idSupplier } });
        if (!supplier) throw new NotFoundException('Proveedor no encontrado');
        if (supplier.idClub !== product.idClub) throw new BadRequestException('El proveedor no pertenece a este club');
        data.idSupplier = idSupplier;
      }
    }

    const updated = await this.prisma.product_Inventory.update({ where: { id }, data });
    return sanitizeDecimal(sanitizeDates(updated, ['createdAt']), ['currentStock', 'minStock', 'costPerUnit']);
  }

  async removeProduct(id: number, user: RequestUser) {
    const product = await this.prisma.product_Inventory.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    await this.assertClubAccess(product.idClub, user);
    const inUse = await this.prisma.supply_Order.findFirst({ where: { idProductInventory: id } });
    if (inUse) throw new BadRequestException('No se puede eliminar: hay pedidos asociados a este producto');
    await this.prisma.product_Inventory.delete({ where: { id } });
    return { message: 'Producto eliminado correctamente' };
  }

  async createOrder(dto: CreateSupplyOrderDto, user: RequestUser) {
    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');
    await this.assertClubAccess(dto.idClub, user);

    const supplier = await this.prisma.supplier.findUnique({ where: { id: dto.idSupplier } });
    if (!supplier) throw new NotFoundException('Proveedor no encontrado');
    if (supplier.idClub !== dto.idClub) throw new BadRequestException('El proveedor no pertenece a este club');

    const product = await this.prisma.product_Inventory.findUnique({ where: { id: dto.idProductInventory } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    if (product.idClub !== dto.idClub) throw new BadRequestException('El producto no pertenece a este club');

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

  async findOrdersByClub(idClub: number, user: RequestUser) {
    await this.assertClubAccess(idClub, user);
    const orders = await this.prisma.supply_Order.findMany({ where: { idClub }, orderBy: { orderDate: 'desc' } });
    return orders.map((o) => sanitizeDecimal(sanitizeDates(o, ['orderDate', 'estimatedArrival', 'receivedDate']), ['quantity', 'totalCost']));
  }

  async updateOrder(id: number, dto: UpdateSupplyOrderDto, user: RequestUser) {
    const order = await this.prisma.supply_Order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    await this.assertClubAccess(order.idClub, user);

    const { idClub, ...rest } = dto as any;

    if (order.status === 'Recibido') {
      const touchesMore = Object.keys(rest).some((key) => key !== 'notes' && rest[key] !== undefined);
      if (touchesMore) throw new BadRequestException('Un pedido recibido ya no se puede modificar');
    }

    if (rest.idSupplier !== undefined) {
      const supplier = await this.prisma.supplier.findUnique({ where: { id: rest.idSupplier } });
      if (!supplier || supplier.idClub !== order.idClub) throw new BadRequestException('El proveedor no pertenece a este club');
    }
    if (rest.idProductInventory !== undefined) {
      const product = await this.prisma.product_Inventory.findUnique({ where: { id: rest.idProductInventory } });
      if (!product || product.idClub !== order.idClub) throw new BadRequestException('El producto no pertenece a este club');
    }

    const data: any = { ...rest };
    if (dto.estimatedArrival !== undefined) data.estimatedArrival = dto.estimatedArrival ? new Date(dto.estimatedArrival) : null;
    if (dto.receivedDate !== undefined) data.receivedDate = dto.receivedDate ? new Date(dto.receivedDate) : null;

    if (dto.status !== 'Recibido') {
      const updated = await this.prisma.supply_Order.update({ where: { id }, data });
      return sanitizeDecimal(sanitizeDates(updated, ['orderDate', 'estimatedArrival', 'receivedDate']), ['quantity', 'totalCost']);
    }

    const received = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.supply_Order.updateMany({
        where: { id, status: { not: 'Recibido' } },
        data: { ...data, receivedDate: data.receivedDate ?? new Date() },
      });
      if (claimed.count === 0) throw new BadRequestException('Este pedido ya fue recibido');

      const current = await tx.supply_Order.findUniqueOrThrow({ where: { id } });
      await tx.product_Inventory.update({
        where: { id: current.idProductInventory },
        data: { currentStock: { increment: Number(current.quantity) } },
      });
      return current;
    });

    return sanitizeDecimal(sanitizeDates(received, ['orderDate', 'estimatedArrival', 'receivedDate']), ['quantity', 'totalCost']);
  }

  async removeOrder(id: number, user: RequestUser) {
    const order = await this.prisma.supply_Order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    await this.assertClubAccess(order.idClub, user);
    await this.prisma.supply_Order.delete({ where: { id } });
    return { message: 'Pedido eliminado correctamente' };
  }
}
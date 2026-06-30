import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFinancialEntryDto } from './dto/create-financial-entry.dto';
import { UpdateFinancialEntryDto } from './dto/update-financial-entry.dto';

export interface UnifiedMovement {
  id: string;
  source: 'payment_income' | 'payment_commission' | 'supply_order' | 'manual';
  date: string;
  type: 'Ingreso' | 'Egreso';
  category: string;
  description: string;
  amount: number;
  status: string;
  editable: boolean;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async getMovements(idClub: number) {
    const movements: UnifiedMovement[] = [];

    const payments = await this.prisma.payment.findMany({
      where: { idClub, paymentStatus: 'Exitoso' },
      orderBy: { paymentDate: 'desc' },
    });
    for (const p of payments) {
      movements.push({
        id: `payment-income-${p.id}`,
        source: 'payment_income',
        date: p.paymentDate.toISOString(),
        type: 'Ingreso',
        category: 'Suscripciones',
        description: `Pago de suscripción #${p.idUserSubscription}`,
        amount: Number(p.clubAmount),
        status: 'Confirmado',
        editable: false,
      });
      movements.push({
        id: `payment-commission-${p.id}`,
        source: 'payment_commission',
        date: p.paymentDate.toISOString(),
        type: 'Egreso',
        category: 'Comisión AuraBox',
        description: `Comisión AuraBox sobre pago #${p.idUserSubscription}`,
        amount: Number(p.commissionAmount),
        status: 'Confirmado',
        editable: false,
      });
    }

    const orders = await this.prisma.supply_Order.findMany({
      where: { idClub, status: 'Recibido' },
      orderBy: { orderDate: 'desc' },
    });
    const products = await this.prisma.product_Inventory.findMany({
      where: { idClub },
      select: { id: true, name: true },
    });
    const productNameById = new Map(products.map((p) => [p.id, p.name]));
    for (const o of orders) {
      movements.push({
        id: `supply-order-${o.id}`,
        source: 'supply_order',
        date: (o.receivedDate ?? o.orderDate).toISOString(),
        type: 'Egreso',
        category: 'Proveedores e Insumos',
        description: `Pedido de ${productNameById.get(o.idProductInventory) ?? 'insumo'}`,
        amount: Number(o.totalCost),
        status: 'Pagado',
        editable: false,
      });
    }

    const manual = await this.prisma.financial_Entry.findMany({
      where: { idClub },
      orderBy: { entryDate: 'desc' },
    });
    for (const m of manual) {
      movements.push({
        id: `manual-${m.id}`,
        source: 'manual',
        date: m.entryDate.toISOString(),
        type: m.type === 'Ingreso' ? 'Ingreso' : 'Egreso',
        category: m.category,
        description: m.description,
        amount: Number(m.amount),
        status: m.status,
        editable: true,
      });
    }

    movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const monthlyTotals: Record<string, { ingresos: number; egresos: number; balance: number }> = {};
    for (const mv of movements) {
      const key = monthKey(new Date(mv.date));
      if (!monthlyTotals[key]) monthlyTotals[key] = { ingresos: 0, egresos: 0, balance: 0 };
      if (mv.type === 'Ingreso') monthlyTotals[key].ingresos += mv.amount;
      else monthlyTotals[key].egresos += mv.amount;
      monthlyTotals[key].balance = monthlyTotals[key].ingresos - monthlyTotals[key].egresos;
    }

    const totalIngresos = movements.filter((m) => m.type === 'Ingreso').reduce((s, m) => s + m.amount, 0);
    const totalEgresos = movements.filter((m) => m.type === 'Egreso').reduce((s, m) => s + m.amount, 0);

    return {
      movements,
      monthlyTotals,
      summary: {
        totalIngresos,
        totalEgresos,
        balance: totalIngresos - totalEgresos,
        totalAuraboxCommission: movements.filter((m) => m.source === 'payment_commission').reduce((s, m) => s + m.amount, 0),
        totalSupplyExpenses: movements.filter((m) => m.source === 'supply_order').reduce((s, m) => s + m.amount, 0),
      },
    };
  }

  async createEntry(dto: CreateFinancialEntryDto) {
    const club = await this.prisma.club.findUnique({ where: { id: dto.idClub } });
    if (!club) throw new NotFoundException('Club no encontrado');

    return this.prisma.financial_Entry.create({
      data: {
        idClub: dto.idClub,
        type: dto.type,
        category: dto.category,
        description: dto.description,
        amount: dto.amount,
        entryDate: dto.entryDate ? new Date(dto.entryDate) : new Date(),
        status: dto.status ?? 'Confirmado',
      },
    });
  }

  async updateEntry(id: number, dto: UpdateFinancialEntryDto) {
    const entry = await this.prisma.financial_Entry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Movimiento no encontrado');

    const data: any = { ...dto };
    if (dto.entryDate !== undefined) data.entryDate = new Date(dto.entryDate);

    return this.prisma.financial_Entry.update({ where: { id }, data });
  }

  async removeEntry(id: number) {
    const entry = await this.prisma.financial_Entry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundException('Movimiento no encontrado');
    await this.prisma.financial_Entry.delete({ where: { id } });
    return { message: 'Movimiento eliminado correctamente' };
  }
}
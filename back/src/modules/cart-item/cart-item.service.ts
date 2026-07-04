import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { CheckoutCartDto } from './dto/checkout-cart.dto';

function mapPlan(p: any) {
  let includes: string[] = [];
  if (p.includes) {
    try { includes = JSON.parse(p.includes); } catch { includes = []; }
  }
  return {
    planId: p.id,
    name: p.name,
    description: p.description,
    price: p.basePrice ? Number(p.basePrice) : 0,
    currency: 'ARS',
    deliveryFrequency: p.frequency,
    image: p.imageUrl ?? '',
    includes,
    active: p.active,
    cashDiscount: p.cashDiscount ? Number(p.cashDiscount) : 0,
    transferDiscount: p.transferDiscount ? Number(p.transferDiscount) : 0,
  };
}

@Injectable()
export class CartItemService {
  constructor(private readonly prisma: PrismaService) {}

  async addToCart(idUser: number, dto: CreateCartItemDto) {
    const plan = await this.prisma.subscription_Types.findUnique({ where: { id: dto.idSubscriptionTypes } });
    if (!plan) throw new NotFoundException('Plan de suscripción no encontrado');

    const existingSubscription = await this.prisma.user_Subscriptions.findFirst({
      where: {
        idUser,
        idSubscriptionTypes: dto.idSubscriptionTypes,
        subscriptionStatus: { not: 'Cancelada' as any },
      },
    });
    if (existingSubscription) throw new BadRequestException('Ya tienes una suscripción activa a este plan');

    const existing = await this.prisma.cart_Item.findFirst({
      where: { idUser, idSubscriptionTypes: dto.idSubscriptionTypes },
    });
    if (existing) return existing;

    return this.prisma.cart_Item.create({
      data: {
        idUser,
        idSubscriptionTypes: dto.idSubscriptionTypes,
        idPreferredCourier: dto.idPreferredCourier ?? undefined,
        addedAt: new Date(),
      },
    });
  }

  async findByUserEnriched(idUser: number) {
    const items = await this.prisma.cart_Item.findMany({
      where: { idUser },
      orderBy: { addedAt: 'desc' },
    });
    if (items.length === 0) return [];

    const planIds = items.map((i) => i.idSubscriptionTypes);
    const plans = await this.prisma.subscription_Types.findMany({ where: { id: { in: planIds } } });
    const plansById = new Map(plans.map((p) => [p.id, p]));

    const clubIds = [...new Set(plans.map((p) => p.idClub))];
    const clubs = await this.prisma.club.findMany({ where: { id: { in: clubIds } } });
    const clubsById = new Map(clubs.map((c) => [c.id, c]));

    return items
      .map((item) => {
        const plan = plansById.get(item.idSubscriptionTypes);
        if (!plan) return null;
        const club = clubsById.get(plan.idClub);
        if (!club) return null;
        return {
          cartItemId: item.id,
          idSubscriptionTypes: item.idSubscriptionTypes,
          addedAt: item.addedAt.toISOString(),
          plan: mapPlan(plan),
          club: { id: club.id, name: club.name, logoUrl: club.logoUrl, slogan: club.slogan },
        };
      })
      .filter((i): i is NonNullable<typeof i> => i !== null);
  }

  async remove(idUser: number, idSubscriptionTypes: number) {
    const item = await this.prisma.cart_Item.findFirst({ where: { idUser, idSubscriptionTypes } });
    if (!item) throw new NotFoundException('El plan no está en tu carrito');
    await this.prisma.cart_Item.delete({ where: { id: item.id } });
    return { ok: true };
  }

  async clear(idUser: number) {
    await this.prisma.cart_Item.deleteMany({ where: { idUser } });
    return { ok: true };
  }

  async checkout(idUser: number, dto: CheckoutCartDto) {
    const items = await this.prisma.cart_Item.findMany({ where: { idUser } });
    if (items.length === 0) throw new BadRequestException('Tu carrito está vacío');

    const created: any[] = [];
    for (const item of items) {
      const existingSubscription = await this.prisma.user_Subscriptions.findFirst({
        where: {
          idUser,
          idSubscriptionTypes: item.idSubscriptionTypes,
          subscriptionStatus: { not: 'Cancelada' as any },
        },
      });
      if (existingSubscription) continue;

      const sub = await this.prisma.user_Subscriptions.create({
        data: {
          idUser,
          idSubscriptionTypes: item.idSubscriptionTypes,
          idPaymentMethods: dto.idPaymentMethods ?? undefined,
          startDate: new Date(),
          subscriptionStatus: 'Activa' as any,
        },
      });
      created.push(sub);
    }

    await this.prisma.cart_Item.deleteMany({ where: { idUser } });
    return { createdCount: created.length, subscriptions: created };
  }
}
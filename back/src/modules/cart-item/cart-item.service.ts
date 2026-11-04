import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { CheckoutCartDto } from './dto/checkout-cart.dto';
import { AURABOX_COMMISSION, AUTO_CONFIRM_TRANSFERS, PAYMENT_METHOD_CODES } from '../payments/payments.constants';
import { nextPaymentFrom, priceFor } from '../../common/utils/billing';
import { findOrCreateMethod, getAcceptedCodes } from '../../common/utils/payment-methods';

const CLOSED_STATUSES = ['Cancelada', 'Finalizada'];

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

  private async assertPlanAvailable(planId: number) {
    const plan = await this.prisma.subscription_Types.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan de suscripción no encontrado');
    const club = await this.prisma.club.findUnique({ where: { id: plan.idClub } });
    if (!plan.active || !club || club.clubStatus !== 'APROBADO') {
      throw new BadRequestException('Este plan no está disponible');
    }
    return plan;
  }

  private async buildPaymentOptions(planIds: number[]) {
    const plans = await this.prisma.subscription_Types.findMany({ where: { id: { in: planIds } } });
    const clubIds = Array.from(new Set(plans.map((p) => p.idClub)));
    const clubs = await this.prisma.club.findMany({ where: { id: { in: clubIds } } });

    let methods: string[] = [...PAYMENT_METHOD_CODES];
    for (const club of clubs) {
      const accepted: string[] = await getAcceptedCodes(this.prisma, club.id);
      methods = methods.filter((code) => accepted.includes(code));
    }

    const transferBlockedBy = clubs
      .filter((club) => !club.bankHolder || (!club.bankCbu && !club.bankAlias))
      .map((club) => club.name);
    if (transferBlockedBy.length > 0) {
      methods = methods.filter((code) => code !== 'transferencia');
    }

    const banks = clubs.map((club) => ({
      clubId: club.id,
      clubName: club.name,
      holder: club.bankHolder,
      cbu: club.bankCbu,
      alias: club.bankAlias,
    }));

    return { methods, banks, transferBlockedBy, plans, clubs };
  }

  async addToCart(idUser: number, dto: CreateCartItemDto) {
    await this.assertPlanAvailable(dto.idSubscriptionTypes);

    const existingSubscription = await this.prisma.user_Subscriptions.findFirst({
      where: {
        idUser,
        idSubscriptionTypes: dto.idSubscriptionTypes,
        subscriptionStatus: { notIn: CLOSED_STATUSES as any },
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

  async getPaymentOptions(idUser: number) {
    const items = await this.prisma.cart_Item.findMany({ where: { idUser } });
    if (items.length === 0) return { methods: [], banks: [], transferBlockedBy: [] };
    const { methods, banks, transferBlockedBy } = await this.buildPaymentOptions(
      items.map((item) => item.idSubscriptionTypes),
    );
    return { methods, banks, transferBlockedBy };
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

    const planIds = items.map((i) => i.idSubscriptionTypes);
    const options = await this.buildPaymentOptions(planIds);
    if (!options.methods.includes(dto.paymentMethod)) {
      throw new BadRequestException(
        options.methods.length === 0
          ? 'Los planes de tu carrito no comparten un medio de pago. Quitá alguno para continuar.'
          : 'Ese medio de pago no está disponible para los planes de tu carrito',
      );
    }

    const { plans, clubs } = options;
    const planById = new Map(plans.map((p) => [p.id, p] as [number, typeof p]));
    const clubById = new Map(clubs.map((c) => [c.id, c] as [number, typeof c]));

    const current = await this.prisma.user_Subscriptions.findMany({
      where: {
        idUser,
        idSubscriptionTypes: { in: planIds },
        subscriptionStatus: { notIn: CLOSED_STATUSES as any },
      },
      select: { idSubscriptionTypes: true },
    });
    const alreadySubscribed = new Set(current.map((s) => s.idSubscriptionTypes));

    if (alreadySubscribed.size > 0) {
      await this.prisma.cart_Item.deleteMany({
        where: { idUser, idSubscriptionTypes: { in: Array.from(alreadySubscribed) } },
      });
    }

    const isTransfer = dto.paymentMethod === 'transferencia';
    const confirmNow = !isTransfer || AUTO_CONFIRM_TRANSFERS;
    const toCreate: { plan: (typeof plans)[number]; amount: number }[] = [];

    for (const item of items) {
      if (alreadySubscribed.has(item.idSubscriptionTypes)) continue;
      const plan = planById.get(item.idSubscriptionTypes);
      const club = plan ? clubById.get(plan.idClub) : undefined;
      if (!plan || !club) throw new BadRequestException('Un plan de tu carrito ya no existe');
      if (!plan.active || club.clubStatus !== 'APROBADO') {
        throw new BadRequestException(`"${plan.name}" ya no está disponible. Quitalo del carrito para continuar.`);
      }
      const amount = priceFor(plan.basePrice, plan.transferDiscount, isTransfer);
      if (!Number.isFinite(amount) || amount <= AURABOX_COMMISSION) {
        throw new BadRequestException(`El precio de "${plan.name}" no es válido`);
      }
      toCreate.push({ plan, amount });
    }

    if (toCreate.length === 0) {
      throw new BadRequestException('Ya tenés una suscripción vigente a los planes de tu carrito');
    }

    const method = await findOrCreateMethod(this.prisma, dto.paymentMethod as any);
    const now = new Date();
    const subscriptionStatus = confirmNow ? 'Activa' : 'Pendiente_Pago';
    const paymentStatus = confirmNow ? 'Exitoso' : 'Pendiente';
    const streetNumber = parseInt(dto.address.streetNumber, 10);

    const created = await this.prisma.$transaction(async (tx) => {
      const results: any[] = [];

      for (const { plan, amount } of toCreate) {
        const sub = await tx.user_Subscriptions.create({
          data: {
            idUser,
            idSubscriptionTypes: plan.id,
            idPaymentMethods: method.id,
            startDate: now,
            subscriptionStatus: subscriptionStatus as any,
            lastPaymentDate: confirmNow ? now : undefined,
            nextPaymentDate: confirmNow ? (nextPaymentFrom(now, plan.frequency) ?? undefined) : undefined,
            monthlyAmountPaid: confirmNow ? String(amount) : undefined,
          },
        });

        await tx.payment.create({
          data: {
            idUserSubscription: sub.id,
            idUser,
            idClub: plan.idClub,
            idPaymentMethods: method.id,
            idGatewayTransaction: confirmNow ? `SIM-${now.getTime()}-${sub.id}` : null,
            totalAmountPaid: String(amount),
            clubAmount: String(amount - AURABOX_COMMISSION),
            commissionAmount: String(AURABOX_COMMISSION),
            paymentDate: now,
            paymentStatus: paymentStatus as any,
          },
        });

        results.push(sub);
      }

      await tx.user.update({
        where: { id: idUser },
        data: {
          streetAddress: dto.address.street,
          addressNumber: Number.isNaN(streetNumber) ? undefined : streetNumber,
          city: dto.address.city,
          province: dto.address.province,
          postalCode: dto.address.postalCode,
          addressDetails: dto.address.instructions || null,
        },
      });

      await tx.cart_Item.deleteMany({ where: { idUser } });
      return results;
    });

    return {
      createdCount: created.length,
      pendingPayment: !confirmNow,
      total: toCreate.reduce((sum, entry) => sum + entry.amount, 0),
      subscriptions: created,
    };
  }
}
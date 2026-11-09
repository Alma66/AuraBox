import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { CheckoutCartDto } from './dto/checkout-cart.dto';
import {
  AURABOX_COMMISSION,
  AUTO_CONFIRM_TRANSFERS,
  PAYMENT_METHOD_CODES,
  PaymentMethodCode,
} from '../payments/payments.constants';
import { nextPaymentFrom, priceFor } from '../../common/utils/billing';
import { findOrCreateMethod, getAcceptedCodes } from '../../common/utils/payment-methods';
import { courierFee } from '../../common/utils/shipping';

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

  private async buildShippingOptions(idUser: number, planIds: number[]) {
    const plans = await this.prisma.subscription_Types.findMany({ where: { id: { in: planIds } } });
    const clubIds = Array.from(new Set(plans.map((p) => p.idClub)));
    const clubs = await this.prisma.club.findMany({ where: { id: { in: clubIds } } });
    const links = await this.prisma.club_Courier.findMany({
      where: { idClub: { in: clubIds }, active: true },
    });
    const courierIds = Array.from(new Set(links.map((link) => link.idCourier)));
    const couriers = courierIds.length
      ? await this.prisma.courier.findMany({ where: { id: { in: courierIds }, active: true } })
      : [];
    const courierById = new Map(couriers.map((courier) => [courier.id, courier] as [number, typeof courier]));
    const preferences = await this.prisma.user_Courier_Preference.findMany({
      where: { idUser, idClub: { in: clubIds }, active: true },
    });

    return clubs.map((club) => {
      const couriersOfClub = links
        .filter((link) => link.idClub === club.id)
        .map((link) => {
          const courier = courierById.get(link.idCourier);
          if (!courier) return null;
          return {
            id: courier.id,
            name: courier.name,
            isInternal: courier.isInternal,
            fee: courierFee(courier.isInternal, link.baseFee),
          };
        })
        .filter((option): option is NonNullable<typeof option> => option !== null)
        .sort((a, b) => a.name.localeCompare(b.name));

      const preferred = preferences.find(
        (pref) => pref.idClub === club.id && couriersOfClub.some((option) => option.id === pref.idCourier),
      );

      return {
        clubId: club.id,
        clubName: club.name,
        couriers: couriersOfClub,
        selectedCourierId: preferred ? preferred.idCourier : null,
      };
    });
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

  async getShippingOptions(idUser: number) {
    const items = await this.prisma.cart_Item.findMany({ where: { idUser } });
    if (items.length === 0) return [];
    return this.buildShippingOptions(
      idUser,
      items.map((item) => item.idSubscriptionTypes),
    );
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

    const shippingOptions = await this.buildShippingOptions(idUser, planIds);
    const shippingByClub = new Map(shippingOptions.map((entry) => [entry.clubId, entry] as [number, typeof entry]));
    const chosenByClub = new Map(
      (dto.shipping ?? []).map((entry) => [entry.idClub, entry.idCourier] as [number, number]),
    );

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

    const code = dto.paymentMethod as PaymentMethodCode;
    const isTransfer = code === 'transferencia';
    const isCash = code === 'efectivo';
    const paymentConfirmed = isCash ? false : !isTransfer || AUTO_CONFIRM_TRANSFERS;
    const subscriptionActive = isCash || paymentConfirmed;

    const toCreate: {
      plan: (typeof plans)[number];
      club: (typeof clubs)[number];
      planAmount: number;
      shippingFee: number;
      courier: { id: number; name: string; fee: number } | null;
      amount: number;
    }[] = [];

    for (const item of items) {
      if (alreadySubscribed.has(item.idSubscriptionTypes)) continue;
      const plan = planById.get(item.idSubscriptionTypes);
      const club = plan ? clubById.get(plan.idClub) : undefined;
      if (!plan || !club) throw new BadRequestException('Un plan de tu carrito ya no existe');
      if (!plan.active || club.clubStatus !== 'APROBADO') {
        throw new BadRequestException(`"${plan.name}" ya no está disponible. Quitalo del carrito para continuar.`);
      }

      const planAmount = priceFor(plan, code);
      if (!Number.isFinite(planAmount) || planAmount <= AURABOX_COMMISSION) {
        throw new BadRequestException(`El precio de "${plan.name}" no es válido`);
      }

      let courier: { id: number; name: string; fee: number } | null = null;
      const clubShipping = shippingByClub.get(plan.idClub);
      if (clubShipping && clubShipping.couriers.length > 0) {
        const chosenId = chosenByClub.get(plan.idClub);
        const match = clubShipping.couriers.find((option) => option.id === chosenId);
        if (!match) {
          throw new BadRequestException(`Elegí una empresa de envío para "${club.name}"`);
        }
        courier = { id: match.id, name: match.name, fee: match.fee };
      }

      const shippingFee = courier ? courier.fee : 0;
      toCreate.push({ plan, club, planAmount, shippingFee, courier, amount: planAmount + shippingFee });
    }

    if (toCreate.length === 0) {
      throw new BadRequestException('Ya tenés una suscripción vigente a los planes de tu carrito');
    }

    const method = await findOrCreateMethod(this.prisma, code);
    const now = new Date();
    const subscriptionStatus = subscriptionActive ? 'Activa' : 'Pendiente_Pago';
    const paymentStatus = paymentConfirmed ? 'Exitoso' : 'Pendiente';
    const streetNumber = parseInt(dto.address.streetNumber, 10);

    const created = await this.prisma.$transaction(async (tx) => {
      const cleared = await tx.cart_Item.deleteMany({
        where: { idUser, idSubscriptionTypes: { in: toCreate.map((entry) => entry.plan.id) } },
      });
      if (cleared.count !== toCreate.length) {
        throw new BadRequestException('Tu carrito cambió mientras comprabas. Recargalo e intentá de nuevo.');
      }

      const results: any[] = [];

      for (const { plan, amount } of toCreate) {
        const sub = await tx.user_Subscriptions.create({
          data: {
            idUser,
            idSubscriptionTypes: plan.id,
            idPaymentMethods: method.id,
            startDate: now,
            subscriptionStatus: subscriptionStatus as any,
            lastPaymentDate: paymentConfirmed ? now : undefined,
            nextPaymentDate: subscriptionActive ? (nextPaymentFrom(now, plan.frequency) ?? undefined) : undefined,
            monthlyAmountPaid: paymentConfirmed ? String(amount) : undefined,
          },
        });

        await tx.payment.create({
          data: {
            idUserSubscription: sub.id,
            idUser,
            idClub: plan.idClub,
            idPaymentMethods: method.id,
            idGatewayTransaction: paymentConfirmed ? `SIM-${now.getTime()}-${sub.id}` : null,
            totalAmountPaid: String(amount),
            clubAmount: String(amount - AURABOX_COMMISSION),
            commissionAmount: String(AURABOX_COMMISSION),
            paymentDate: now,
            paymentStatus: paymentStatus as any,
          },
        });

        results.push(sub);
      }

      const chosenPairs = new Map<number, number>();
      toCreate.forEach((entry) => {
        if (entry.courier) chosenPairs.set(entry.plan.idClub, entry.courier.id);
      });
      for (const [idClub, idCourier] of Array.from(chosenPairs.entries())) {
        await tx.user_Courier_Preference.updateMany({
          where: { idUser, idClub, idCourier: { not: idCourier } },
          data: { active: false },
        });
        await tx.user_Courier_Preference.upsert({
          where: { idUser_idClub_idCourier: { idUser, idClub, idCourier } },
          update: { active: true },
          create: { idUser, idClub, idCourier, active: true },
        });
      }

      await tx.user.update({
        where: { id: idUser },
        data: {
          streetAddress: dto.address.street,
          addressNumber: Number.isNaN(streetNumber) ? undefined : streetNumber,
          city: dto.address.city,
          province: dto.address.province,
          locality: dto.address.locality,          
          postalCode: dto.address.postalCode,
          addressDetails: dto.address.instructions || null,
        },
      });


      return results;
    });

    const total = toCreate.reduce((sum, entry) => sum + entry.amount, 0);
    const shippingTotal = toCreate.reduce((sum, entry) => sum + entry.shippingFee, 0);

    return {
      createdCount: created.length,
      pendingPayment: !paymentConfirmed,
      cashOnDelivery: isCash,
      total,
      shippingTotal,
      subscriptions: created,
      receipt: {
        reference: `AB-${String(created[0].id).padStart(6, '0')}`,
        date: now.toISOString(),
        method: code,
        pending: !paymentConfirmed,
        total,
        shippingTotal,
        items: toCreate.map((entry) => ({
          planName: entry.plan.name,
          clubName: entry.club.name,
          planAmount: entry.planAmount,
          shippingFee: entry.shippingFee,
          courierName: entry.courier ? entry.courier.name : null,
          total: entry.amount,
        })),
      },
    };
  }
}
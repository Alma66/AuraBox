import { PrismaService } from '../../prisma/prisma.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { CheckoutCartDto } from './dto/checkout-cart.dto';
import { PaymentMethodCode } from '../payments/payments.constants';
export declare class CartItemService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private assertPlanAvailable;
    private buildPaymentOptions;
    private buildShippingOptions;
    addToCart(idUser: number, dto: CreateCartItemDto): Promise<{
        id: number;
        idUser: number;
        idSubscriptionTypes: number;
        idPreferredCourier: number | null;
        addedAt: Date;
    }>;
    findByUserEnriched(idUser: number): Promise<{
        cartItemId: number;
        idSubscriptionTypes: number;
        addedAt: string;
        plan: {
            planId: any;
            name: any;
            description: any;
            price: number;
            currency: string;
            deliveryFrequency: any;
            image: any;
            includes: string[];
            active: any;
            cashDiscount: number;
            transferDiscount: number;
        };
        club: {
            id: number;
            name: string;
            logoUrl: string;
            slogan: string | null;
        };
    }[]>;
    getPaymentOptions(idUser: number): Promise<{
        methods: string[];
        banks: {
            clubId: number;
            clubName: string;
            holder: string | null;
            cbu: string | null;
            alias: string | null;
        }[];
        transferBlockedBy: string[];
    }>;
    getShippingOptions(idUser: number): Promise<{
        clubId: number;
        clubName: string;
        couriers: {
            id: number;
            name: string;
            isInternal: boolean;
            fee: number;
        }[];
        selectedCourierId: number | null;
    }[]>;
    remove(idUser: number, idSubscriptionTypes: number): Promise<{
        ok: boolean;
    }>;
    clear(idUser: number): Promise<{
        ok: boolean;
    }>;
    checkout(idUser: number, dto: CheckoutCartDto): Promise<{
        createdCount: number;
        pendingPayment: boolean;
        cashOnDelivery: boolean;
        total: number;
        shippingTotal: number;
        subscriptions: any[];
        receipt: {
            reference: string;
            date: string;
            method: PaymentMethodCode;
            pending: boolean;
            total: number;
            shippingTotal: number;
            items: {
                planName: string;
                clubName: string;
                planAmount: number;
                shippingFee: number;
                courierName: string | null;
                total: number;
            }[];
        };
    }>;
}

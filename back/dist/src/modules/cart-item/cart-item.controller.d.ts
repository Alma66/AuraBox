import { CartItemService } from './cart-item.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { CheckoutCartDto } from './dto/checkout-cart.dto';
export declare class CartItemController {
    private readonly cartItemService;
    constructor(cartItemService: CartItemService);
    addToCart(dto: CreateCartItemDto, req: any): Promise<{
        id: number;
        idUser: number;
        idSubscriptionTypes: number;
        idPreferredCourier: number | null;
        addedAt: Date;
    }>;
    findMine(req: any): Promise<{
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
    paymentOptions(req: any): Promise<{
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
    checkout(dto: CheckoutCartDto, req: any): Promise<{
        createdCount: number;
        pendingPayment: boolean;
        cashOnDelivery: boolean;
        total: number;
        shippingTotal: number;
        subscriptions: any[];
        receipt: {
            reference: string;
            date: string;
            method: import("../payments/payments.constants").PaymentMethodCode;
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
    shippingOptions(req: any): Promise<{
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
    remove(idSubscriptionTypes: number, req: any): Promise<{
        ok: boolean;
    }>;
    clear(req: any): Promise<{
        ok: boolean;
    }>;
}

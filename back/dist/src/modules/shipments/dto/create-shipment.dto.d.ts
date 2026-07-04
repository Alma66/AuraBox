import { ShipmentStatus } from '@prisma/client';
export declare class CreateShipmentDto {
    idUser: number;
    idUserSubscriptions: number;
    idClub?: number;
    idAssignedRider?: number;
    idCourier?: number;
    boxMonthYear: string;
    estimatedDeliveryStartDate?: string;
    estimatedDeliveryEndDate?: string;
    actualDeliveryDate?: string;
    trackingNumber?: string;
    shippingCost?: number;
    shippingNotes?: string;
    street?: string;
    addressNumber?: string;
    locality?: string;
    city?: string;
    postalCode?: string;
    province?: string;
    instructions?: string;
    boxContent?: string;
    deliveryWindowFrom?: string;
    deliveryWindowTo?: string;
    shipmentStatus: ShipmentStatus;
}

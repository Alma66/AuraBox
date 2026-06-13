import { ShipmentStatus } from '@prisma/client';
export declare class CreateShipmentDto {
    idUser: number;
    idUserSubscriptions: number;
    idClub?: number;
    boxMonthYear: string;
    estimatedDeliveryStartDate?: string;
    estimatedDeliveryEndDate?: string;
    actualDeliveryDate?: string;
    trackingNumber?: string;
    logisticsCompany?: string;
    shippingCost?: number;
    shippingNotes?: string;
    shipmentStatus: ShipmentStatus;
}

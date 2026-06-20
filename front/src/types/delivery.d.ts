export type ShipmentStatusValue = 'Pendiente' | 'Asignado' | 'En_Camino' | 'Entregado' | 'Problema' | 'Devuelto';
export type VehicleTypeValue = 'Moto' | 'Auto' | 'Bicicleta' | 'A_Pie';

export interface ShipmentUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ShipmentRider {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: number | null;
  email: string;
}

export interface Courier {
  id: number;
  code: string;
  name: string;
  isInternal: boolean;
  active: boolean;
}

export interface Shipment {
  id: number;
  idUser: number;
  idUserSubscriptions: number;
  idClub: number | null;
  idAssignedRider: number | null;
  idCourier: number | null;
  boxMonthYear: string;
  estimatedDeliveryStartDate: string | null;
  estimatedDeliveryEndDate: string | null;
  actualDeliveryDate: string | null;
  shipmentStatus: ShipmentStatusValue;
  trackingNumber: string | null;
  shippingCost: string | null;
  shippingNotes: string | null;
  street: string | null;
  addressNumber: string | null;
  locality: string | null;
  city: string | null;
  postalCode: string | null;
  province: string | null;
  instructions: string | null;
  boxContent: string | null;
  deliveryWindowFrom: string | null;
  deliveryWindowTo: string | null;
  user?: ShipmentUser | null;
  rider?: ShipmentRider | null;
  courier?: Courier | null;
}

export interface PendingDeliveryAddress {
  street: string | null;
  addressNumber: number | null;
  floorNumber: string | null;
  addressDetails: string | null;
  city: string | null;
  postalCode: string | null;
  province: string | null;
}

export interface PendingDeliveryUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: number | null;
  address: PendingDeliveryAddress;
}

export interface PendingDelivery {
  idUserSubscriptions: number;
  idUser: number;
  idSubscriptionTypes: number;
  subscriptionName: string | null;
  boxMonthYear: string;
  user: PendingDeliveryUser | null;
  availableCouriers: Courier[];
}

export interface RiderProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: number | null;
  vehicleType: VehicleTypeValue | null;
  licensePlate: string | null;
  availability: boolean;
  isActive: boolean;
  zonesCovered: string | null;
  totalDeliveries: number;
  currentAssignments: number;
}
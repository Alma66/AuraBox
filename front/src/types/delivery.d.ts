import { User } from './user';
import { Club } from './club';
import { Subscription } from './subscription';

export interface Rider {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  vehicleType: 'moto' | 'auto' | 'bicicleta' | 'a_pie';
  licensePlate?: string;
  availability: boolean;
  rating: number;
  totalDeliveries: number;
  currentAssignments: number;
  zonesCovered: string[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Delivery {
  id: string;
  subscriptionId: string;
  userId: string;
  clubId: string;
  planId: string;
  deliveryDate: string;
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
  assignedRiderId?: string;
  trackingNumber?: string;
  shippingProvider: 'rider_propio' | 'correo_argentino' | 'oca' | 'andreani';
  address: {
    street: string;
    number: string;
    locality: string;
    city: string;
    postalCode: string;
    province: string;
    instructions?: string;
  };
  boxContent: string;
  estimatedDeliveryWindow: {
    from: string;
    to: string;
  };
  cost: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryAssignment {
  id: string;
  deliveryId: string;
  riderId: string;
  assignedAt: string;
  completedAt?: string;
  feedback?: {
    rating: number;
    comments: string;
  };
}

export interface DeliveryHistoryEntry extends Delivery {
  user: Partial<User>;
  club: Partial<Club>;
  subscription: Partial<Subscription>;
  rider?: Partial<Rider>;
}

export type ShipmentStatusValue = 'Pendiente' | 'Asignado' | 'En_Camino' | 'Entregado' | 'Problema' | 'Devuelto';

export interface ShipmentUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Shipment {
  id: number;
  idUser: number;
  idUserSubscriptions: number;
  idClub: number | null;
  idAssignedRider: number | null;
  boxMonthYear: string;
  estimatedDeliveryStartDate: string | null;
  estimatedDeliveryEndDate: string | null;
  actualDeliveryDate: string | null;
  shipmentStatus: ShipmentStatusValue;
  trackingNumber: string | null;
  logisticsCompany: string | null;
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
}

export interface RiderProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: number | null;
  vehicleType: 'Moto' | 'Auto' | 'Bicicleta' | 'A_Pie' | null;
  licensePlate: string | null;
  availability: boolean;
  isActive: boolean;
  zonesCovered: string | null;
  totalDeliveries: number;
  currentAssignments: number;
}
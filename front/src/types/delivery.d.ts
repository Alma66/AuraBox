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
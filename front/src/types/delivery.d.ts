// FileName: /src/types/delivery.d.ts

import { User } from './user';
import { Club } from './club';
import { Subscription } from './subscription';

export interface Rider {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  vehicleType: 'moto' | 'auto' | 'bicicleta' | 'a_pie';
  licensePlate?: string; // Para vehículos motorizados
  availability: boolean; // Disponible para asignaciones
  rating: number; // Promedio de calificaciones (1-5)
  totalDeliveries: number;
  currentAssignments: number; // Entregas asignadas actualmente
  zonesCovered: string[]; // Zonas o provincias que cubre (ej: ['CABA', 'GBA'])
  isActive: boolean; // Rider activo en el sistema
  createdAt: string;
  lastLogin?: string;
}

export interface Delivery {
  id: string;
  subscriptionId: string;
  userId: string; // ID del cliente receptor
  clubId: string;
  planId: string;
  deliveryDate: string; // Fecha programada de entrega
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
  assignedRiderId?: string; // ID del rider asignado (null si no asignado)
  trackingNumber?: string; // Número de seguimiento (para Correo Argentino u otros)
  shippingProvider: 'rider_propio' | 'correo_argentino' | 'oca' | 'andreani'; // Proveedor de envío
  address: {
    street: string;
    number: string;
    locality: string;
    city: string;
    postalCode: string;
    province: string;
    instructions?: string; // Instrucciones adicionales (ej: "Dejar en portería")
  };
  boxContent: string; // Descripción del contenido de la caja (ej: "Libro X + accesorios")
  estimatedDeliveryWindow: {
    from: string; // Hora estimada inicio (ej: "09:00")
    to: string;   // Hora estimada fin (ej: "18:00")
  };
  cost: number; // Costo estimado del envío
  notes?: string; // Notas internas (ej: "Cliente ausente en entregas previas")
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryAssignment {
  id: string;
  deliveryId: string;
  riderId: string;
  assignedAt: string;
  completedAt?: string; // Fecha de finalización
  feedback?: {
    rating: number;
    comments: string;
  };
}

export interface DeliveryHistoryEntry extends Delivery {
  user: Partial<User>; // Datos básicos del cliente
  club: Partial<Club>; // Datos básicos del club
  subscription: Partial<Subscription>; // Datos de la suscripción relacionada
  rider?: Partial<Rider>; // Rider asignado, si aplica
}
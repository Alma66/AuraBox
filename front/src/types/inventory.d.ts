export interface SupplyCategory {
  id: number;
  idClub: number;
  name: string;
  description?: string | null;
  createdAt: string;
}

export interface SupplierItem {
  id: number;
  idClub: number;
  name: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  notes?: string | null;
  active: boolean;
  createdAt: string;
  categoryIds: number[];
}

export interface ProductInventoryItem {
  id: number;
  idClub: number;
  idSupplyCategory: number;
  idSupplier?: number | null;
  name: string;
  description?: string | null;
  unitType: string;
  currentStock: string;
  minStock: string;
  costPerUnit: string;
  active: boolean;
  createdAt: string;
}

export type SupplyOrderStatus = 'Pendiente' | 'En_Camino' | 'Recibido' | 'Cancelado';

export interface SupplyOrderItem {
  id: number;
  idClub: number;
  idSupplier: number;
  idProductInventory: number;
  quantity: string;
  totalCost: string;
  status: SupplyOrderStatus;
  orderDate: string;
  estimatedArrival?: string | null;
  receivedDate?: string | null;
  notes?: string | null;
}
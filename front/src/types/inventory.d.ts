// src/types/inventory.d.ts

export type UnitType = 'unidad' | 'paquete' | 'gramos' | 'porción' | 'kg' | 'litro' | 'ml' | 'metro' | 'cm'; // Añadí más opciones para ser más completo

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string; // ID de ProductCategory
  supplierId: string; // ID de Supplier
  unitType: UnitType;
  currentStock: number;
  minStock: number;
  costPerUnit: number;
}

export interface Packaging {
  id: string;
  name: string;
  description: string;
  type: 'caja' | 'bolsa' | 'etiqueta' | 'relleno' | 'otro'; // Añadí 'otro' para flexibilidad
  supplierId: string; // ID de Supplier
  unitType: UnitType;
  currentStock: number;
  minStock: number;
  costPerUnit: number;
}

export interface Supplier {
  id: string;
  name: string;
  mail: string; // Ahora es una propiedad directa
  phone: string; // Ahora es una propiedad directa
  type: 'product' | 'packaging' | 'general';
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
}

export interface InventoryData {
  products: Product[];
  packaging: Packaging[];
  suppliers: Supplier[];
  productCategories: ProductCategory[];
}

export type UnitType = 'unidad' | 'paquete' | 'gramos' | 'porción' | 'kg' | 'litro' | 'ml' | 'metro' | 'cm'; 

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string; 
  supplierId: string; 
  unitType: UnitType;
  currentStock: number;
  minStock: number;
  costPerUnit: number;
}

export interface Packaging {
  id: string;
  name: string;
  description: string;
  type: 'caja' | 'bolsa' | 'etiqueta' | 'relleno' | 'otro'; 
  supplierId: string; 
  unitType: UnitType;
  currentStock: number;
  minStock: number;
  costPerUnit: number;
}

export interface Supplier {
  id: string;
  name: string;
  mail: string; 
  phone: string; 
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
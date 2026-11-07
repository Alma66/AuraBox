import { InventoryService } from './inventory.service';
import { CreateSupplyCategoryDto } from './dto/create-supply-category.dto';
import { UpdateSupplyCategoryDto } from './dto/update-supply-category.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { CreateProductInventoryDto } from './dto/create-product-inventory.dto';
import { UpdateProductInventoryDto } from './dto/update-product-inventory.dto';
import { CreateSupplyOrderDto } from './dto/create-supply-order.dto';
import { UpdateSupplyOrderDto } from './dto/update-supply-order.dto';
export declare class InventoryController {
    private readonly svc;
    constructor(svc: InventoryService);
    createCategory(dto: CreateSupplyCategoryDto, req: any): Promise<{
        id: number;
        name: string;
        description: string | null;
        idClub: number;
        createdAt: Date;
    }>;
    findCategories(idClub: number, req: any): Promise<{
        id: number;
        name: string;
        description: string | null;
        idClub: number;
        createdAt: Date;
    }[]>;
    updateCategory(id: number, dto: UpdateSupplyCategoryDto, req: any): Promise<{
        id: number;
        name: string;
        description: string | null;
        idClub: number;
        createdAt: Date;
    }>;
    removeCategory(id: number, req: any): Promise<{
        message: string;
    }>;
    createSupplier(dto: CreateSupplierDto, req: any): Promise<{
        categoryIds: number[];
        id: number;
        name: string;
        idClub: number;
        contactEmail: string | null;
        active: boolean;
        createdAt: Date;
        notes: string | null;
        address: string | null;
        contactPhone: string | null;
    }>;
    findSuppliers(idClub: number, req: any): Promise<{
        categoryIds: number[];
        id: number;
        name: string;
        idClub: number;
        contactEmail: string | null;
        active: boolean;
        createdAt: Date;
        notes: string | null;
        address: string | null;
        contactPhone: string | null;
    }[]>;
    updateSupplier(id: number, dto: UpdateSupplierDto, req: any): Promise<{
        categoryIds: number[];
        id: number;
        name: string;
        idClub: number;
        contactEmail: string | null;
        active: boolean;
        createdAt: Date;
        notes: string | null;
        address: string | null;
        contactPhone: string | null;
    }>;
    removeSupplier(id: number, req: any): Promise<{
        message: string;
    }>;
    createProduct(dto: CreateProductInventoryDto, req: any): Promise<any>;
    findProducts(idClub: number, req: any): Promise<any[]>;
    updateProduct(id: number, dto: UpdateProductInventoryDto, req: any): Promise<any>;
    removeProduct(id: number, req: any): Promise<{
        message: string;
    }>;
    createOrder(dto: CreateSupplyOrderDto, req: any): Promise<any>;
    findOrders(idClub: number, req: any): Promise<any[]>;
    updateOrder(id: number, dto: UpdateSupplyOrderDto, req: any): Promise<any>;
    removeOrder(id: number, req: any): Promise<{
        message: string;
    }>;
}

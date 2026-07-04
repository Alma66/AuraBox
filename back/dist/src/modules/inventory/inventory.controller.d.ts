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
    createCategory(dto: CreateSupplyCategoryDto): Promise<{
        name: string;
        description: string | null;
        createdAt: Date;
        id: number;
        idClub: number;
    }>;
    findCategories(idClub: number): Promise<{
        name: string;
        description: string | null;
        createdAt: Date;
        id: number;
        idClub: number;
    }[]>;
    updateCategory(id: number, dto: UpdateSupplyCategoryDto): Promise<{
        name: string;
        description: string | null;
        createdAt: Date;
        id: number;
        idClub: number;
    }>;
    removeCategory(id: number): Promise<{
        message: string;
    }>;
    createSupplier(dto: CreateSupplierDto): Promise<{
        categoryIds: number[];
        name: string;
        createdAt: Date;
        id: number;
        active: boolean;
        notes: string | null;
        contactEmail: string | null;
        idClub: number;
        contactPhone: string | null;
        address: string | null;
    }>;
    findSuppliers(idClub: number): Promise<{
        categoryIds: number[];
        name: string;
        createdAt: Date;
        id: number;
        active: boolean;
        notes: string | null;
        contactEmail: string | null;
        idClub: number;
        contactPhone: string | null;
        address: string | null;
    }[]>;
    updateSupplier(id: number, dto: UpdateSupplierDto): Promise<{
        categoryIds: number[];
        name: string;
        createdAt: Date;
        id: number;
        active: boolean;
        notes: string | null;
        contactEmail: string | null;
        idClub: number;
        contactPhone: string | null;
        address: string | null;
    }>;
    removeSupplier(id: number): Promise<{
        message: string;
    }>;
    createProduct(dto: CreateProductInventoryDto): Promise<any>;
    findProducts(idClub: number): Promise<any[]>;
    updateProduct(id: number, dto: UpdateProductInventoryDto): Promise<any>;
    removeProduct(id: number): Promise<{
        message: string;
    }>;
    createOrder(dto: CreateSupplyOrderDto): Promise<any>;
    findOrders(idClub: number): Promise<any[]>;
    updateOrder(id: number, dto: UpdateSupplyOrderDto): Promise<any>;
    removeOrder(id: number): Promise<{
        message: string;
    }>;
}

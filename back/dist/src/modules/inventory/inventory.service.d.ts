import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupplyCategoryDto } from './dto/create-supply-category.dto';
import { UpdateSupplyCategoryDto } from './dto/update-supply-category.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { CreateProductInventoryDto } from './dto/create-product-inventory.dto';
import { UpdateProductInventoryDto } from './dto/update-product-inventory.dto';
import { CreateSupplyOrderDto } from './dto/create-supply-order.dto';
import { UpdateSupplyOrderDto } from './dto/update-supply-order.dto';
type RequestUser = {
    id: number;
    role: string;
};
export declare class InventoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private assertClubAccess;
    createCategory(dto: CreateSupplyCategoryDto, user: RequestUser): Promise<{
        id: number;
        name: string;
        description: string | null;
        idClub: number;
        createdAt: Date;
    }>;
    findCategoriesByClub(idClub: number, user: RequestUser): Promise<{
        id: number;
        name: string;
        description: string | null;
        idClub: number;
        createdAt: Date;
    }[]>;
    updateCategory(id: number, dto: UpdateSupplyCategoryDto, user: RequestUser): Promise<{
        id: number;
        name: string;
        description: string | null;
        idClub: number;
        createdAt: Date;
    }>;
    removeCategory(id: number, user: RequestUser): Promise<{
        message: string;
    }>;
    createSupplier(dto: CreateSupplierDto, user: RequestUser): Promise<{
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
    findSuppliersByClub(idClub: number, user: RequestUser): Promise<{
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
    findSupplierById(id: number): Promise<{
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
    updateSupplier(id: number, dto: UpdateSupplierDto, user: RequestUser): Promise<{
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
    removeSupplier(id: number, user: RequestUser): Promise<{
        message: string;
    }>;
    createProduct(dto: CreateProductInventoryDto, user: RequestUser): Promise<any>;
    findProductsByClub(idClub: number, user: RequestUser): Promise<any[]>;
    updateProduct(id: number, dto: UpdateProductInventoryDto, user: RequestUser): Promise<any>;
    removeProduct(id: number, user: RequestUser): Promise<{
        message: string;
    }>;
    createOrder(dto: CreateSupplyOrderDto, user: RequestUser): Promise<any>;
    findOrdersByClub(idClub: number, user: RequestUser): Promise<any[]>;
    updateOrder(id: number, dto: UpdateSupplyOrderDto, user: RequestUser): Promise<any>;
    removeOrder(id: number, user: RequestUser): Promise<{
        message: string;
    }>;
}
export {};

import { PrismaService } from '../../prisma/prisma.service';
import { CreateFinancialEntryDto } from './dto/create-financial-entry.dto';
import { UpdateFinancialEntryDto } from './dto/update-financial-entry.dto';
export interface UnifiedMovement {
    id: string;
    source: 'payment_income' | 'payment_commission' | 'supply_order' | 'manual';
    date: string;
    type: 'Ingreso' | 'Egreso';
    category: string;
    description: string;
    amount: number;
    status: string;
    editable: boolean;
}
export declare class FinanceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMovements(idClub: number): Promise<{
        movements: UnifiedMovement[];
        monthlyTotals: Record<string, {
            ingresos: number;
            egresos: number;
            balance: number;
        }>;
        summary: {
            totalIngresos: number;
            totalEgresos: number;
            balance: number;
            totalAuraboxCommission: number;
            totalSupplyExpenses: number;
        };
    }>;
    getProfitability(idClub: number): Promise<{
        breakdown: {
            idSubscriptionType: number;
            name: string;
            basePrice: number;
            activeSubscribers: number;
            revenue: number;
            auraboxCommission: number;
            shippingCost: number;
            allocatedInventoryCost: number;
            netMargin: number;
            marginPercent: number;
        }[];
        totals: {
            totalRevenue: number;
            totalCommission: number;
            totalShipping: number;
            totalInventoryCost: number;
            totalNetMargin: number;
        };
    }>;
    createEntry(dto: CreateFinancialEntryDto): Promise<{
        description: string;
        createdAt: Date;
        id: number;
        idClub: number;
        status: import("@prisma/client").$Enums.FinancialEntryStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        category: string;
        type: import("@prisma/client").$Enums.FinancialEntryType;
        entryDate: Date;
    }>;
    updateEntry(id: number, dto: UpdateFinancialEntryDto): Promise<{
        description: string;
        createdAt: Date;
        id: number;
        idClub: number;
        status: import("@prisma/client").$Enums.FinancialEntryStatus;
        amount: import("@prisma/client/runtime/library").Decimal;
        category: string;
        type: import("@prisma/client").$Enums.FinancialEntryType;
        entryDate: Date;
    }>;
    removeEntry(id: number): Promise<{
        message: string;
    }>;
}

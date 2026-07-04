import { FinanceService } from './finance.service';
import { CreateFinancialEntryDto } from './dto/create-financial-entry.dto';
import { UpdateFinancialEntryDto } from './dto/update-financial-entry.dto';
export declare class FinanceController {
    private readonly svc;
    constructor(svc: FinanceService);
    getMovements(idClub: number): Promise<{
        movements: import("./finance.service").UnifiedMovement[];
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

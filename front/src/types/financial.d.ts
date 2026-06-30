export type FinancialMovementType = 'Ingreso' | 'Egreso';
export type FinancialMovementSource = 'payment_income' | 'payment_commission' | 'supply_order' | 'manual';

export interface FinancialMovement {
  id: string;
  source: FinancialMovementSource;
  date: string;
  type: FinancialMovementType;
  category: string;
  description: string;
  amount: number;
  status: string;
  editable: boolean;
}

export interface MonthlyTotal {
  ingresos: number;
  egresos: number;
  balance: number;
}

export interface FinanceSummary {
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
  totalAuraboxCommission: number;
  totalSupplyExpenses: number;
}

export interface FinancialData {
  movements: FinancialMovement[];
  monthlyTotals: Record<string, MonthlyTotal>;
  summary: FinanceSummary;
}
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

export interface ProfitabilityBreakdownItem {
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
}

export interface ProfitabilityTotals {
  totalRevenue: number;
  totalCommission: number;
  totalShipping: number;
  totalInventoryCost: number;
  totalNetMargin: number;
}

export interface ProfitabilityData {
  breakdown: ProfitabilityBreakdownItem[];
  totals: ProfitabilityTotals;
}

export type TeamUserRole = 'administrador_del_club' | 'delivery_rider' | string;
export type TeamUserStatus = 'activo' | 'inactivo';

export interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: TeamUserRole;
  status: TeamUserStatus;
  assignedDate: string;
}

export type GeneralSettingCategory = 'finances' | 'team' | 'notifications';
export type GeneralSettingValue = string | number | boolean | string[];

export interface GeneralSetting {
  key: string;
  value: GeneralSettingValue;
  category: GeneralSettingCategory;
}
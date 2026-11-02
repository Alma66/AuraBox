const FREQUENCY_MONTHS: Record<string, number> = {
  Mensual: 1,
  Bimestral: 2,
  Trimestral: 3,
  Cuatrimestral: 4,
  Quinquemestral: 5,
  Semestral: 6,
  Anual: 12,
};

export const addMonths = (from: Date, months: number) => {
  const result = new Date(from);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
};

export const nextPaymentFrom = (from: Date, frequency: string): Date | null => {
  const months = FREQUENCY_MONTHS[frequency];
  return months ? addMonths(from, months) : null;
};
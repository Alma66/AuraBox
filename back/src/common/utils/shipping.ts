export function courierFee(isInternal: boolean, baseFee: unknown): number {
  if (isInternal || baseFee === null || baseFee === undefined) return 0;
  const value = Number(baseFee);
  return Number.isFinite(value) && value > 0 ? value : 0;
}
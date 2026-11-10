export const formatMoney = (value: number): string =>
  `ARS ${Number(value || 0).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
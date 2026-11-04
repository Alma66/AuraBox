import { Transform } from 'class-transformer';

export const PHONE_REGEX = /^\d{8,15}$/;

export const PHONE_MESSAGE = 'El teléfono debe tener entre 8 y 15 dígitos';

export const normalizePhone = (value: unknown): string | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const digits = String(value).replace(/\D/g, '');
  return digits === '' ? null : digits;
};

export const NormalizePhone = () => Transform(({ value }) => normalizePhone(value));
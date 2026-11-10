export type CategoryGroupKey = 'gourmet' | 'lectura' | 'belleza' | 'hogar';

const GROUP_KEYWORDS: Record<CategoryGroupKey, string[]> = {
  gourmet: ['vinos', 'cafe', 'cerveza', 'quesos', 'embutidos', 'dulces', 'chocolate', 'snacks', 'especias', 'te', 'destilados'],
  lectura: ['libros', 'papeleria', 'arte', 'anime', 'gaming'],
  belleza: ['belleza', 'bienestar', 'joyeria', 'moda'],
  hogar: ['plantas', 'velas', 'cristales', 'mascotas'],
};

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const isGroupKey = (value: string | null): value is CategoryGroupKey =>
  value !== null && Object.prototype.hasOwnProperty.call(GROUP_KEYWORDS, value);

export const categoryIdsForGroup = (group: string | null, categories: { id: number; name: string }[]): number[] => {
  if (!isGroupKey(group)) return [];
  const keywords = GROUP_KEYWORDS[group];
  return categories
    .filter((category) =>
      normalize(category.name)
        .split(/[^a-z0-9]+/)
        .some((word) => keywords.some((keyword) => word === keyword || (keyword.length > 3 && word.startsWith(keyword))))
    )
    .map((category) => category.id);
};
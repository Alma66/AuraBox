const ACCENTS = ['bg-aurora-terracotta', 'bg-aurora-navy', 'bg-aurora-berry', 'bg-aurora-teal'];

export const clubAccent = (id: string | number): string => {
  const text = String(id);
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 997;
  }
  return ACCENTS[hash % ACCENTS.length];
};
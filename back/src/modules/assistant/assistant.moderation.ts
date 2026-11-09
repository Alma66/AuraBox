export type ModerationReason = 'profanity' | 'image' | 'code' | 'injection' | 'selfharm';

export interface ModerationResult {
  allowed: boolean;
  reason?: ModerationReason;
  reply?: string;
}

const LEET: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '@': 'a',
  '$': 's',
};

const REPLIES: Record<ModerationReason, string> = {
  profanity: 'Prefiero que mantengamos un trato respetuoso. Contame en qué te puedo ayudar con AuraBox.',
  image: 'No puedo generar imágenes ni archivos. Soy un asistente para resolver dudas sobre AuraBox: suscripciones, pagos, envíos y tu cuenta. ¿En qué te ayudo?',
  code: 'No puedo escribir código ni programas. Puedo ayudarte con dudas sobre cómo usar AuraBox.',
  injection: 'No puedo cambiar mis reglas ni compartir mis instrucciones. ¿Tenés alguna duda sobre AuraBox?',
  selfharm:
    'Lamento que estés pasando por algo tan difícil. No estás solo/a: hablá con alguien de confianza o con un profesional. Si estás en peligro o necesitás ayuda urgente, llamá al 911 (o al 107 para emergencias de salud) en Argentina. Yo no puedo ayudarte con esto, pero me importa que estés bien.',
};

const BLOCKED_TERMS = [
  'puta', 'puto', 'putas', 'putos', 'putita', 'putito', 'hdp', 'ctm', 'lpm',
  'pelotudo', 'pelotuda', 'pelotudos', 'pelotudas',
  'forro', 'forra', 'forros', 'forras',
  'concha', 'conchudo', 'conchuda', 'mierda', 'verga', 'pija',
  'culiado', 'culiada', 'maricon', 'trolo', 'trola', 'zorra', 'sudaca',
  'mogolico', 'retrasado', 'imbecil', 'idiota', 'estupido', 'estupida',
  'hijo de puta', 'hija de puta', 'la puta madre',
  'porno', 'pornografia',
  'fuck', 'fucking', 'shit', 'bitch', 'asshole', 'cunt', 'slut', 'whore', 'nigger', 'faggot',
];

function stripAccents(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeForWords(text: string) {
  return stripAccents(text)
    .replace(/[013457@$]/g, (char) => LEET[char] ?? char)
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\b([a-z])((?:\s[a-z]){2,})\b/g, (match) => match.replace(/\s/g, ''))
    .replace(/([a-z])\1+/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

const NORMALIZED_TERMS = BLOCKED_TERMS.map(normalizeForWords);

export function containsProfanity(text: string): boolean {
  const padded = ` ${normalizeForWords(text)} `;
  return NORMALIZED_TERMS.some((term) => padded.includes(` ${term} `));
}

const PATTERNS: { reason: Exclude<ModerationReason, 'profanity'>; test: RegExp }[] = [
  {
    reason: 'selfharm',
    test: /\b(suicid\w*|matarme|quitarme la vida|hacerme dano|no quiero vivir|me quiero morir|quiero morir(me)?)\b/,
  },
  {
    reason: 'injection',
    test: /\b(ignor\w*|olvid\w*|omit\w*|salte\w*|desactiv\w*)\b.{0,40}\b(instruccion\w*|reglas|restriccion\w*|filtro\w*|indicacion\w*)\b/,
  },
  {
    reason: 'injection',
    test: /\b(system prompt|prompt del sistema|prompt inicial|instrucciones internas|tus instrucciones|reglas internas)\b/,
  },
  {
    reason: 'injection',
    test: /\b(modo (desarrollador|developer|dios|sin restricciones|sin filtros)|jailbreak|dan mode|do anything now)\b/,
  },
  {
    reason: 'injection',
    test: /\b(actua|actues|actuar|comportate|hazte pasar|finge|fingi|pretende)\b.{0,25}\b(como|de|ser)\b/,
  },
  {
    reason: 'injection',
    test: /\b(ignore (all|any|previous|the above)|you are now|pretend to be)\b/,
  },
  {
    reason: 'image',
    test: /\b(genera|generame|generar|generes|dibuja|dibujame|dibujar|disena|disename|disenar|ilustra|ilustrame|pinta|pintame)\b.{0,25}\b(imagen|imagenes|foto|fotos|fotografia|dibujo|ilustracion|logo|logotipo|meme|wallpaper|avatar|video|videos)\b/,
  },
  {
    reason: 'image',
    test: /\b(crea|creame|crear|haceme|hazme|armame)\s+(una|un|unas|unos)\s+(imagen|foto|dibujo|ilustracion|logo|logotipo|meme|wallpaper|avatar|video)\b/,
  },
  {
    reason: 'image',
    test: /\b(midjourney|dall-?e|stable diffusion|text to image)\b/,
  },
  {
    reason: 'code',
    test: /\b(escrib\w*|program\w*|codifica\w*|haceme|armame|genera\w*)\b.{0,40}\b(python|javascript|typescript|java|html|css|sql|react|node|c\+\+|script|algoritmo|programa|codigo fuente)\b/,
  },
  {
    reason: 'code',
    test: /\b(python|javascript|typescript|c\+\+|sql)\b.{0,30}\b(codigo|script|funcion|programa)\b/,
  },
];

export function moderateText(text: string): ModerationResult {
  const plain = stripAccents(text);
  for (const rule of PATTERNS) {
    if (rule.test.test(plain)) return { allowed: false, reason: rule.reason, reply: REPLIES[rule.reason] };
  }
  if (containsProfanity(text)) return { allowed: false, reason: 'profanity', reply: REPLIES.profanity };
  return { allowed: true };
}
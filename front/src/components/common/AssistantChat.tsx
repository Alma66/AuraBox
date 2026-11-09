import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api, { getResponseData } from '../../api/config';

interface ClubCard {
  id: number;
  name: string;
  logoUrl: string | null;
  slogan: string | null;
  rating: number | null;
  totalReviews: number;
  fromPrice: number;
  frequencies: string[];
  categories: string[];
}

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  blocked?: boolean;
  clubs?: ClubCard[];
}

interface AssistantChatProps {
  open: boolean;
  onClose: () => void;
}

type Detail = 'brief' | 'detailed';

const MAX_INPUT = 400;
const STORAGE_KEY = 'aurabox_assistant_chat';
const LINK_PATTERN = /\[([^\]]{1,80})\]\((\/(?!\/)[a-zA-Z0-9\-_/?=&#%.]*)\)/g;

const priceFormatter = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

const GREETING =
  '¡Hola! 👋 Soy el asistente virtual de AuraBox. Puedo ayudarte con suscripciones, pagos, envíos y tu cuenta, y también a encontrar un club. ¿Qué necesitás?';

const getSuggestions = (path: string): string[] => {
  if (path.startsWith('/checkout')) {
    return [
      '¿Qué medios de pago puedo usar?',
      '¿Cómo elijo la empresa de envío?',
      '¿Los pagos son reales?',
      '¿Cómo funciona el efectivo contra entrega?',
    ];
  }
  if (path.startsWith('/explore')) {
    return [
      'Busco una caja de café hasta $20.000 al mes',
      'Ayudame a encontrar un club',
      '¿Cómo funcionan los envíos?',
      '¿Qué medios de pago hay?',
    ];
  }
  if (path.startsWith('/club/')) {
    return [
      '¿Cómo me suscribo a este plan?',
      '¿Cómo funcionan las reseñas?',
      '¿Cómo se envían las cajas?',
      '¿Qué medios de pago acepta un club?',
    ];
  }
  if (path.startsWith('/customer')) {
    return [
      '¿Dónde veo mis suscripciones?',
      '¿Cómo cambio mi contraseña?',
      '¿Cómo dejo una reseña?',
      '¿Cómo desactivo mi cuenta?',
    ];
  }
  if (path.startsWith('/entrepreneur')) {
    return [
      '¿Qué puedo gestionar desde mi panel?',
      '¿Cómo se aprueba mi club?',
      '¿Cómo funcionan los envíos del club?',
      '¿Qué medios de pago puede aceptar mi club?',
    ];
  }
  return [
    'Ayudame a encontrar un club',
    '¿Cómo me suscribo a una caja?',
    '¿Qué medios de pago hay?',
    '¿Cómo funcionan los envíos?',
  ];
};

const loadMessages = (): ChatMessage[] => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item) =>
          item &&
          (item.role === 'user' || item.role === 'assistant') &&
          typeof item.content === 'string' &&
          typeof item.id === 'number',
      )
      .map((item) => ({ ...item, clubs: Array.isArray(item.clubs) ? item.clubs : undefined }))
      .slice(-30);
  } catch {
    return [];
  }
};

const cleanContent = (text: string) =>
  text.replace(/\*\*/g, '').replace(/\[([^\]]{1,80})\]\((?!\/(?!\/))[^)]*\)/g, '$1');

const renderContent = (text: string, onNavigate: () => void): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  const pattern = new RegExp(LINK_PATTERN.source, 'g');
  const content = cleanContent(text);
  let lastIndex = 0;
  let match: RegExpExecArray | null = pattern.exec(content);
  while (match !== null) {
    if (match.index > lastIndex) nodes.push(content.slice(lastIndex, match.index));
    nodes.push(
      <Link
        key={`link-${match.index}`}
        to={match[2]}
        onClick={onNavigate}
        className="font-semibold text-aurora-terracotta underline"
      >
        {match[1]}
      </Link>,
    );
    lastIndex = match.index + match[0].length;
    match = pattern.exec(content);
  }
  if (lastIndex < content.length) nodes.push(content.slice(lastIndex));
  return nodes;
};

const ClubResultCard: React.FC<{ club: ClubCard; onNavigate: () => void }> = ({ club, onNavigate }) => (
  <div className="rounded-xl border border-aurora-navy/10 bg-white p-3 shadow-sm">
    <div className="flex items-start gap-3">
      {club.logoUrl ? (
        <img src={club.logoUrl} alt="" loading="lazy" className="h-12 w-12 flex-shrink-0 rounded-lg object-cover" />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-aurora-cream font-bold text-aurora-navy"
        >
          {club.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-aurora-navy">{club.name}</p>
        <p className="text-xs text-aurora-navy/60">
          {club.rating !== null && club.totalReviews > 0
            ? `★ ${club.rating.toFixed(1)} (${club.totalReviews} ${club.totalReviews === 1 ? 'reseña' : 'reseñas'})`
            : 'Sin reseñas todavía'}
        </p>
        {club.slogan && <p className="mt-1 truncate text-xs text-aurora-navy/70">{club.slogan}</p>}
      </div>
    </div>
    <div className="mt-2 flex flex-wrap items-center gap-1">
      <span className="mr-1 text-sm font-semibold text-aurora-terracotta">
        Desde {priceFormatter.format(club.fromPrice)}
      </span>
      {club.frequencies.map((frequency) => (
        <span key={frequency} className="rounded-full bg-aurora-cream px-2 py-0.5 text-[11px] text-aurora-navy">
          {frequency}
        </span>
      ))}
    </div>
    <Link
      to={`/club/${club.id}`}
      onClick={onNavigate}
      className="mt-3 flex min-h-[44px] items-center justify-center rounded-xl bg-aurora-terracotta px-3 text-sm font-semibold text-white transition-colors hover:bg-aurora-terracottaDark"
    >
      Ver club
    </Link>
  </div>
);

const AssistantChat: React.FC<AssistantChatProps> = ({ open, onClose }) => {
  const location = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextId = useRef(messages.reduce((max, item) => Math.max(max, item.id), 0) + 1);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => getSuggestions(location.pathname), [location.pathname]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending, open]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      return;
    }
  }, [messages]);

  const handleNavigate = () => {
    if (window.matchMedia('(max-width: 640px)').matches) onClose();
  };

  const send = async (text: string, detail: Detail = 'brief') => {
    const content = text.trim();
    if (!content || sending) return;
    const userMessage: ChatMessage = { id: nextId.current++, role: 'user', content };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setSending(true);
    setError(null);
    try {
      const response = await api.post('/assistant/chat', {
        messages: nextMessages.slice(-8).map((message) => ({ role: message.role, content: message.content })),
        detail,
      });
      const data = getResponseData(response) as { reply: string; blocked?: boolean; clubs?: ClubCard[] };
      setMessages((prev) => [
        ...prev,
        {
          id: nextId.current++,
          role: 'assistant',
          content: data.reply,
          blocked: Boolean(data.blocked),
          clubs: Array.isArray(data.clubs) ? data.clubs : undefined,
        },
      ]);
    } catch (err: any) {
      if (err?.response?.status === 429) {
        setError('Estás enviando muchos mensajes. Esperá un momento y probá de nuevo.');
      } else {
        setError('No pudimos responder en este momento. Intentá de nuevo en unos minutos.');
      }
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setMessages([]);
    setError(null);
    setInput('');
  };

  if (!open) return null;

  const lastMessage = messages[messages.length - 1];
  const canExpand =
    !sending && lastMessage && lastMessage.role === 'assistant' && !lastMessage.blocked && !lastMessage.clubs;

  return (
    <div
      role="dialog"
      aria-label="Asistente virtual de AuraBox"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      className="fixed bottom-4 right-4 z-[90] flex h-[34rem] max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-aurora-navy/10 bg-white shadow-xl"
    >
      <div className="flex items-center justify-between bg-aurora-navy px-4 py-3 text-white">
        <div>
          <p className="font-semibold">Asistente AuraBox</p>
          <p className="text-xs text-white/70">Asistente con IA · puede equivocarse</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={reset}
            className="min-h-[44px] rounded-lg px-2 text-xs font-semibold text-white/80 hover:bg-white/10"
          >
            Nueva
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar asistente"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-xl text-white/80 hover:bg-white/10"
          >
            ×
          </button>
        </div>
      </div>

      <div role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto bg-aurora-cream px-4 py-4">
        <div className="max-w-[85%] whitespace-pre-line rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm text-aurora-navy shadow-sm">
          {GREETING}
        </div>

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => send(suggestion)}
                className="min-h-[44px] rounded-full border border-aurora-terracotta/40 bg-white px-3 py-2 text-left text-xs font-semibold text-aurora-terracotta hover:bg-aurora-terracotta/10"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <div
              className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm ${
                message.role === 'user'
                  ? 'ml-auto rounded-tr-sm bg-aurora-terracotta text-white'
                  : 'rounded-tl-sm bg-white text-aurora-navy shadow-sm'
              }`}
            >
              {message.role === 'assistant' ? renderContent(message.content, handleNavigate) : message.content}
            </div>
            {message.clubs && message.clubs.length > 0 && (
              <div className="space-y-2">
                {message.clubs.map((club) => (
                  <ClubResultCard key={club.id} club={club} onNavigate={handleNavigate} />
                ))}
              </div>
            )}
          </div>
        ))}

        {canExpand && (
          <button
            type="button"
            onClick={() => send('Explicame con más detalle, paso a paso.', 'detailed')}
            className="min-h-[44px] rounded-full border border-aurora-navy/20 bg-white px-4 py-2 text-xs font-semibold text-aurora-navy hover:bg-aurora-navy/5"
          >
            Explicame más
          </button>
        )}

        {sending && (
          <div className="max-w-[85%] animate-pulse rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm text-aurora-navy/60 shadow-sm">
            Escribiendo…
          </div>
        )}

        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-aurora-navy/10 bg-white px-3 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT))}
            placeholder="Escribí tu consulta..."
            aria-label="Tu consulta"
            autoComplete="off"
            className="min-h-[44px] flex-1 rounded-xl border border-aurora-navy/15 px-3 text-sm text-aurora-navy focus:outline-none focus:ring-2 focus:ring-aurora-terracotta"
          />
          <button
            type="submit"
            disabled={sending || input.trim().length === 0}
            className="min-h-[44px] rounded-xl bg-aurora-terracotta px-4 text-sm font-semibold text-white transition-colors hover:bg-aurora-terracottaDark disabled:opacity-50"
          >
            Enviar
          </button>
        </form>
        <p className="mt-2 text-center text-[11px] leading-snug text-aurora-navy/50">
          No compartas datos personales ni de pago. Tus mensajes se procesan con un servicio externo de IA.{' '}
          <Link to="/faq" onClick={handleNavigate} className="font-semibold underline">
            Preguntas frecuentes
          </Link>
          {' · '}
          <Link to="/contact" onClick={handleNavigate} className="font-semibold underline">
            Hablar con una persona
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AssistantChat;
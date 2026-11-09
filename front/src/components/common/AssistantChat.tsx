import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getResponseData } from '../../api/config';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

interface AssistantChatProps {
  open: boolean;
  onClose: () => void;
}

const MAX_INPUT = 400;

const GREETING =
  '¡Hola! Soy el asistente virtual de AuraBox. Puedo ayudarte con suscripciones, pagos, envíos y tu cuenta. ¿Qué necesitás saber?';

const SUGGESTIONS = [
  '¿Cómo me suscribo a una caja?',
  '¿Qué medios de pago hay?',
  '¿Cómo funcionan los envíos?',
  '¿Dónde veo mis suscripciones?',
];

const AssistantChat: React.FC<AssistantChatProps> = ({ open, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending, open]);

  const send = async (text: string) => {
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
      });
      const data = getResponseData(response) as { reply: string };
      setMessages((prev) => [...prev, { id: nextId.current++, role: 'assistant', content: data.reply }]);
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

  return (
    <div
      role="dialog"
      aria-label="Asistente virtual de AuraBox"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
      className="fixed bottom-4 right-4 z-[90] flex h-[32rem] max-h-[calc(100vh-7rem)] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-aurora-navy/10 bg-white shadow-xl"
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
            {SUGGESTIONS.map((suggestion) => (
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
          <div
            key={message.id}
            className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm ${
              message.role === 'user'
                ? 'ml-auto rounded-tr-sm bg-aurora-terracotta text-white'
                : 'rounded-tl-sm bg-white text-aurora-navy shadow-sm'
            }`}
          >
            {message.content}
          </div>
        ))}

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
          <Link to="/faq" onClick={onClose} className="font-semibold underline">
            Ver preguntas frecuentes
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AssistantChat;
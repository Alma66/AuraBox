import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AssistantChat from './AssistantChat';
import ChatIcon from './ChatIcon';

const FloatingButtons: React.FC = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      {!chatOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          <Link
            to="/faq"
            className="floating-button group flex h-12 w-12 items-center justify-center rounded-full bg-aurora-navy font-display text-xl font-bold text-white shadow-aurora transition-all duration-300 hover:scale-110 hover:bg-aurora-navyLight active:scale-95"
            aria-label="Preguntas frecuentes"
          >
            <span aria-hidden="true">?</span>
            <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-lg bg-aurora-navyDark px-3 py-1.5 font-sans text-xs font-semibold opacity-0 shadow-aurora-sm transition-opacity duration-200 group-hover:opacity-100">
              Preguntas frecuentes
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="floating-button group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-aurora-terracotta to-aurora-coral text-white shadow-aurora-glow transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Abrir asistente virtual"
            aria-haspopup="dialog"
            style={{ animationDelay: '150ms' }}
          >
            <span className="absolute inset-0 animate-ringPulse rounded-full bg-aurora-terracotta" aria-hidden="true" />
            <ChatIcon className="relative h-7 w-7" />
            <span className="pointer-events-none absolute right-[4.75rem] whitespace-nowrap rounded-lg bg-aurora-navyDark px-3 py-1.5 font-sans text-xs font-semibold opacity-0 shadow-aurora-sm transition-opacity duration-200 group-hover:opacity-100">
              ¿Te ayudo?
            </span>
          </button>
        </div>
      )}

      <AssistantChat open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
};

export default FloatingButtons;
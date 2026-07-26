import React from 'react';
import { Link } from 'react-router-dom';

const FloatingButtons: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
      <Link
        to="/faq"
        className="floating-button bg-aurora-navy text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl font-display font-bold shadow-aurora
                   hover:bg-aurora-navyLight transition-all duration-300 transform hover:scale-110 active:scale-95"
        aria-label="Preguntas Frecuentes"
      >
        ?
      </Link>

      <Link
        to="/contact"
        className="floating-button bg-aurora-terracotta text-white rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-aurora
                   hover:bg-aurora-terracottaDark transition-all duration-300 transform hover:scale-110 active:scale-95 animate-glowPulse"
        aria-label="Soporte y Chat"
        style={{ animationDelay: '150ms' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.75 9.75 0 01-6.75-2.75m1.5-1.5l2.25 2.25m0 0l2.25 2.25M12 21.75V15m-3 0V9m3 6V9m3 0V9M6.75 7.5l-1.5-1.5M15.75 7.5l1.5-1.5M12 3.75h.008v.008H12V3.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      </Link>
    </div>
  );
};

export default FloatingButtons;
import React, { useEffect, useState, useCallback } from 'react';

interface WelcomeModalProps {
  name?: string;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ name, onClose }) => {
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [handleClose]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-200 ${closing ? 'opacity-0' : 'bg-opacity-40 opacity-100'}`}
      onClick={handleClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 flex flex-col items-center text-center animate-fadeInUp"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img src="/aurabox-logo.png" alt="AuraBox" className="h-12 w-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-1">
          ¡Bienvenido de nuevo{name ? `, ${name}` : ''}!
        </h2>
        <p className="text-gray-500 text-sm">Nos alegra tenerte otra vez en AuraBox.</p>
      </div>
    </div>
  );
};

export default WelcomeModal;
import React, { useEffect } from 'react';
import LegalContentRenderer from '../club/LegalContentRenderer';
import { LegalSection } from '../../types/legalSection';

interface LegalContentModalProps {
  title: string;
  sections: LegalSection[];
  onClose: () => void;
}

const LegalContentModal: React.FC<LegalContentModalProps> = ({ title, sections, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-6 flex-1">
          {sections.length > 0 ? (
            <LegalContentRenderer sections={sections} />
          ) : (
            <p className="text-gray-500 text-center">Este contenido todavía no fue cargado.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalContentModal;
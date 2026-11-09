import React from 'react';

interface LoadErrorProps {
  title: string;
  onRetry: () => void;
}

const LoadError: React.FC<LoadErrorProps> = ({ title, onRetry }) => (
  <div className="px-4 py-6 lg:px-8">
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
      <p className="font-semibold">{title}</p>
      <p className="mt-1">Tus datos no se perdieron. Revisá tu conexión e intentá de nuevo.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 min-h-[44px] rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
      >
        Reintentar
      </button>
    </div>
  </div>
);

export default LoadError;
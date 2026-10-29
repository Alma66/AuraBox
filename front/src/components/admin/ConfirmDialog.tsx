import React, { useEffect, useState } from 'react';

interface ConfirmDialogProps {
  title: string;
  description?: string;
  confirmLabel: string;
  danger?: boolean;
  requireReason?: boolean;
  saving?: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  description,
  confirmLabel,
  danger,
  requireReason,
  saving,
  onConfirm,
  onCancel,
}) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  const disabled = saving || (requireReason && !reason.trim());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-aurora-navyDark/50 px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-aurora">
        <h2 className="font-display text-xl font-bold text-aurora-navy">{title}</h2>
        {description && <p className="mt-1 text-sm text-aurora-navy/60">{description}</p>}
        {requireReason && (
          <div className="mt-4">
            <label htmlFor="confirm-reason" className="mb-1 block text-sm font-semibold text-aurora-navy">
              Motivo
            </label>
            <textarea
              id="confirm-reason"
              rows={3}
              maxLength={500}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="min-h-[44px] w-full rounded-lg border border-aurora-navy/15 bg-white px-3 py-2 text-sm text-aurora-navy focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40"
            />
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] rounded-lg border border-aurora-navy/15 px-4 text-sm font-semibold text-aurora-navy hover:bg-aurora-cream"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(reason.trim())}
            disabled={disabled}
            className={`min-h-[44px] rounded-lg px-5 text-sm font-semibold text-white disabled:opacity-50 ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-aurora-terracotta hover:bg-aurora-terracottaDark'
            }`}
          >
            {saving ? 'Guardando...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Subscription, SubscriptionStatus, normalizeStatus } from '../../../types/subscription';
import { User } from '../../../types/user';
import { SubscriptionPlan } from '../../../types/club';
import Icon from '../layout/Icon';
import {
  STATUS_ACTIONS,
  STATUS_COLOR,
  STATUS_DOT,
  STATUS_LABEL,
  StatusAction,
  formatDate,
  formatMoney,
  initialOf,
} from './customerUtils';

interface CustomerDrawerProps {
  customer: User;
  subscriptions: Subscription[];
  plans: SubscriptionPlan[];
  focusSubId: number | null;
  updatingId: number | null;
  onClose: () => void;
  onStatusChange: (sub: Subscription, status: SubscriptionStatus) => Promise<void>;
}

interface PendingConfirm {
  id: number;
  status: SubscriptionStatus;
}

const CustomerDrawer: React.FC<CustomerDrawerProps> = ({
  customer,
  subscriptions,
  plans,
  focusSubId,
  updatingId,
  onClose,
  onStatusChange,
}) => {
  const [expandedId, setExpandedId] = useState<number | null>(focusSubId);
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const ordered = useMemo(
    () => [...subscriptions].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
    [subscriptions],
  );

  const planMap = useMemo(() => new Map(plans.map((p) => [Number(p.planId), p])), [plans]);

  const totalSpent = ordered.reduce((sum, s) => sum + (s.monthlyAmountPaid ? Number(s.monthlyAmountPaid) : 0), 0);
  const activeCount = ordered.filter((s) => normalizeStatus(s.subscriptionStatus) === 'active').length;
  const firstSub = ordered[ordered.length - 1];

  useEffect(() => {
    setExpandedId(focusSubId);
    setConfirm(null);
  }, [focusSubId, customer.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => closeRef.current?.focus(), 50);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const handleAction = async (sub: Subscription, action: StatusAction) => {
    const confirmed = confirm !== null && confirm.id === sub.id && confirm.status === action.status;
    if (action.needsConfirm && !confirmed) {
      setConfirm({ id: sub.id, status: action.status });
      return;
    }
    setConfirm(null);
    await onStatusChange(sub, action.status);
  };

  const contactRows: [string, string | null][] = [
    ['Email', customer.email || null],
    ['Teléfono', customer.phoneNumber ? String(customer.phoneNumber) : null],
    ['Documento', customer.documentNumber ? `${customer.documentType || 'DNI'} ${customer.documentNumber}` : null],
    ['Miembro desde', customer.registrationDate ? formatDate(customer.registrationDate) : null],
    ['Último acceso', customer.lastLogin ? formatDate(customer.lastLogin) : null],
  ];

  const addressRows: [string, string | null][] = [
    ['Calle', customer.streetAddress ? `${customer.streetAddress} ${customer.addressNumber || ''}`.trim() : null],
    ['Piso/Depto', customer.floorNumber ? String(customer.floorNumber) : null],
    ['Detalles', customer.addressDetails || null],
    ['Ciudad', customer.city || null],
    ['Provincia', customer.province || null],
    ['CP', customer.postalCode ? String(customer.postalCode) : null],
  ];

  const visibleAddress = addressRows.filter(([, value]) => value);
  const visibleContact = contactRows.filter(([, value]) => value);

  const kpis: [string, string][] = [
    ['Suscripciones', String(ordered.length)],
    ['Activas', String(activeCount)],
    ['Total abonado', totalSpent > 0 ? formatMoney(totalSpent) : '—'],
    ['Cliente desde', firstSub ? formatDate(firstSub.startDate) : '—'],
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-aurora-navyDark/50"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Ficha de ${customer.firstName} ${customer.lastName}`}
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-aurora-cream shadow-aurora"
      >
        <div className="flex items-center gap-3 border-b border-aurora-navy/10 bg-white px-5 py-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-aurora-navy/10 text-lg font-bold text-aurora-navy">
            {initialOf(customer.firstName)}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-lg font-bold text-aurora-navy">
              {customer.firstName} {customer.lastName}
            </h2>
            <p className="truncate text-xs text-aurora-navy/55">{customer.email}</p>
          </div>
          <span
            className={`hidden flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold sm:inline ${
              customer.active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {customer.active !== false ? 'Cuenta activa' : 'Cuenta inactiva'}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar ficha"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-aurora-navy/60 hover:bg-aurora-cream"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <section aria-label="Resumen del cliente" className="grid grid-cols-2 gap-3">
            {kpis.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-aurora-navy/10 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-aurora-navy/50">{label}</p>
                <p className="mt-1 font-display text-lg font-bold text-aurora-navy">{value}</p>
              </div>
            ))}
          </section>

          <section aria-label="Contacto y dirección" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-aurora-navy/10 bg-white p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-aurora-navy/50">Contacto</h3>
              {visibleContact.length === 0 ? (
                <p className="text-sm text-aurora-navy/45">Sin datos de contacto.</p>
              ) : (
                <dl className="space-y-2 text-sm">
                  {visibleContact.map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3">
                      <dt className="text-aurora-navy/50">{label}</dt>
                      <dd className="min-w-0 truncate text-right font-medium text-aurora-navy">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
            <div className="rounded-xl border border-aurora-navy/10 bg-white p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-aurora-navy/50">Dirección de envío</h3>
              {visibleAddress.length === 0 ? (
                <p className="text-sm text-aurora-navy/45">Sin dirección registrada.</p>
              ) : (
                <dl className="space-y-2 text-sm">
                  {visibleAddress.map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3">
                      <dt className="text-aurora-navy/50">{label}</dt>
                      <dd className="min-w-0 text-right font-medium text-aurora-navy">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </section>

          <section aria-label="Suscripciones e historial">
            <h3 className="mb-3 font-display text-base font-bold text-aurora-navy">Suscripciones e historial</h3>
            {ordered.length === 0 ? (
              <div className="rounded-xl border border-aurora-navy/10 bg-white px-5 py-8 text-center text-sm text-aurora-navy/50">
                Sin suscripciones registradas.
              </div>
            ) : (
              <ol className="space-y-4">
                {ordered.map((sub, idx) => {
                  const status = normalizeStatus(sub.subscriptionStatus);
                  const plan = planMap.get(sub.idSubscriptionTypes);
                  const expanded = expandedId === sub.id;
                  const busy = updatingId === sub.id;
                  return (
                    <li key={sub.id} className="flex gap-3">
                      <span
                        className={`mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${STATUS_DOT[status]}`}
                      >
                        {ordered.length - idx}
                      </span>
                      <div
                        className={`min-w-0 flex-1 rounded-xl border bg-white p-4 ${
                          focusSubId === sub.id ? 'border-aurora-terracotta' : 'border-aurora-navy/10'
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-aurora-navy">
                              {plan?.name ?? `Plan #${sub.idSubscriptionTypes}`}
                            </p>
                            <p className="text-xs text-aurora-navy/50">
                              Inicio: {formatDate(sub.startDate)}
                              {sub.expectedEndDate ? ` · Fin estimado: ${formatDate(sub.expectedEndDate)}` : ''}
                            </p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[status]}`}>
                            {STATUS_LABEL[status]}
                          </span>
                        </div>

                        <dl className="mt-3 grid grid-cols-2 gap-3 text-xs text-aurora-navy/60">
                          {sub.lastPaymentDate && (
                            <div>
                              <dt className="text-aurora-navy/40">Último pago</dt>
                              <dd className="font-medium">{formatDate(sub.lastPaymentDate)}</dd>
                            </div>
                          )}
                          {sub.nextPaymentDate && status !== 'cancelled' && status !== 'finished' && (
                            <div>
                              <dt className="text-aurora-navy/40">Próximo pago</dt>
                              <dd className="font-medium">{formatDate(sub.nextPaymentDate)}</dd>
                            </div>
                          )}
                          {sub.monthlyAmountPaid && (
                            <div>
                              <dt className="text-aurora-navy/40">Monto pagado</dt>
                              <dd className="font-medium text-aurora-terracotta">{formatMoney(Number(sub.monthlyAmountPaid))}</dd>
                            </div>
                          )}
                          {plan && (
                            <div>
                              <dt className="text-aurora-navy/40">Precio del plan</dt>
                              <dd className="font-medium">{formatMoney(plan.price)}</dd>
                            </div>
                          )}
                          {sub.cancellationDate && (
                            <div>
                              <dt className="text-aurora-navy/40">Cancelada</dt>
                              <dd className="font-medium text-red-600">{formatDate(sub.cancellationDate)}</dd>
                            </div>
                          )}
                        </dl>

                        {sub.cancellationReason && (
                          <p className="mt-3 border-t border-aurora-navy/10 pt-2 text-xs text-aurora-navy/70">
                            <span className="text-aurora-navy/40">Motivo: </span>
                            {sub.cancellationReason}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setExpandedId(expanded ? null : sub.id);
                            setConfirm(null);
                          }}
                          aria-expanded={expanded}
                          className="mt-3 flex min-h-[44px] items-center gap-1 text-sm font-semibold text-aurora-terracotta hover:text-aurora-terracottaDark"
                        >
                          Cambiar estado
                          <Icon name={expanded ? 'chevronDown' : 'chevronRight'} className="h-4 w-4" />
                        </button>

                        {expanded && (
                          <div className="mt-2 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              {STATUS_ACTIONS.map((action) => (
                                <button
                                  key={action.status}
                                  type="button"
                                  disabled={busy || sub.subscriptionStatus === action.status}
                                  onClick={() => handleAction(sub, action)}
                                  className={`min-h-[44px] rounded-lg border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${action.tone}`}
                                >
                                  {busy ? '...' : action.label}
                                </button>
                              ))}
                            </div>
                            {confirm && confirm.id === sub.id && (
                              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                <p>
                                  ¿Confirmás pasar esta suscripción a{' '}
                                  <strong>{STATUS_ACTIONS.find((a) => a.status === confirm.status)?.label.toLowerCase()}</strong>?
                                </p>
                                <div className="mt-2 flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const action = STATUS_ACTIONS.find((a) => a.status === confirm.status);
                                      if (action) handleAction(sub, action);
                                    }}
                                    className="min-h-[44px] flex-1 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-700"
                                  >
                                    Sí, confirmar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirm(null)}
                                    className="min-h-[44px] flex-1 rounded-lg border border-red-200 text-sm font-semibold text-red-700 hover:bg-red-100"
                                  >
                                    Volver
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      </aside>
    </div>
  );
};

export default CustomerDrawer;
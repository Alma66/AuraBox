import React from 'react';
import { ShippingInfo } from '../../types/club';

interface ClubPaymentShippingInfoProps {
  paymentMethods?: string[];
  shippingInfo?: ShippingInfo;
}

const ClubPaymentShippingInfo: React.FC<ClubPaymentShippingInfoProps> = ({ paymentMethods, shippingInfo }) => {
  const hasPayments = !!paymentMethods && paymentMethods.length > 0;
  if (!hasPayments && !shippingInfo) {
    return null;
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-aurora-sm ring-1 ring-aurora-navy/5 md:p-10">
      <span className="section-eyebrow">Antes de suscribirte</span>
      <h2 className="mb-8 font-display text-3xl font-medium text-aurora-navy md:text-4xl">Compra y envío</h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {hasPayments && (
          <div className="rounded-2xl bg-aurora-cream p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-aurora-terracotta/15 text-aurora-terracotta">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </span>
              <h3 className="font-display text-xl font-medium text-aurora-navy">Métodos de pago</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {(paymentMethods as string[]).map((method, index) => (
                <span key={index} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-aurora-navy shadow-aurora-sm">
                  {method}
                </span>
              ))}
            </div>
          </div>
        )}
        {shippingInfo && (
          <div className="rounded-2xl bg-aurora-cream p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-aurora-navy/10 text-aurora-navy">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </span>
              <h3 className="font-display text-xl font-medium text-aurora-navy">Zonas de envío</h3>
            </div>
            {shippingInfo.coverage && (
              <p className="mb-2 text-aurora-navy">
                <span className="font-semibold">Cobertura:</span> {shippingInfo.coverage}
              </p>
            )}
            {shippingInfo.details && <p className="text-sm leading-relaxed text-aurora-navy/70">{shippingInfo.details}</p>}
          </div>
        )}
      </div>
    </section>
  );
};

export default ClubPaymentShippingInfo;
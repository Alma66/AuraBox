import React from 'react';
import { ShippingInfo } from '../../types/club';

interface ClubPaymentShippingInfoProps {
  paymentMethods?: string[];
  shippingInfo?: ShippingInfo;
}

const ClubPaymentShippingInfo: React.FC<ClubPaymentShippingInfoProps> = ({ paymentMethods, shippingInfo }) => {
  if ((!paymentMethods || paymentMethods.length === 0) && !shippingInfo) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-8 mb-8 animate-fadeInUp">
      <h2 className="text-2xl font-bold text-aurora-navy mb-4">Información de Compra y Envío</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {paymentMethods && paymentMethods.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-aurora-navy/90 mb-3">Métodos de Pago</h3>
            <div className="flex flex-wrap gap-3">
              {paymentMethods.map((method, index) => (
                <span key={index} className="bg-aurora-terracotta/10 text-aurora-terracottaDark px-4 py-2 rounded-full text-sm font-medium">
                  {method}
                </span>
              ))}
            </div>
          </div>
        )}
        {shippingInfo && (
          <div>
            <h3 className="text-xl font-semibold text-aurora-navy/90 mb-3">Zonas de Envío</h3>
            <p className="text-aurora-navy/80 mb-2">
              <span className="font-semibold">Cobertura:</span> {shippingInfo.coverage}
            </p>
            <p className="text-aurora-navy/70 text-sm leading-relaxed">{shippingInfo.details}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubPaymentShippingInfo;
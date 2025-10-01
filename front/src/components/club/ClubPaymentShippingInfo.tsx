// src/components/club/ClubPaymentShippingInfo.tsx
import React from 'react';
// Asegúrate de que la ruta a 'types/club' sea correcta
import { ShippingInfo } from '../../types/club'; 

interface ClubPaymentShippingInfoProps {
  paymentMethods?: string[]; // Ahora es opcional
  shippingInfo?: ShippingInfo; // Ahora es opcional
}

const ClubPaymentShippingInfo: React.FC<ClubPaymentShippingInfoProps> = ({ paymentMethods, shippingInfo }) => {
  if ((!paymentMethods || paymentMethods.length === 0) && !shippingInfo) {
    return null; // No renderiza nada si no hay información
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8 animate-fadeInUp">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Información de Compra y Envío</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {paymentMethods && paymentMethods.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Métodos de Pago</h3>
            <div className="flex flex-wrap gap-3">
              {paymentMethods.map((method, index) => (
                <span key={index} className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                  {method}
                </span>
              ))}
            </div>
          </div>
        )}
        {shippingInfo && (
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Zonas de Envío</h3>
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Cobertura:</span> {shippingInfo.coverage}
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">{shippingInfo.details}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubPaymentShippingInfo;
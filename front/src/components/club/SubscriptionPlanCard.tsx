import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Specification {
  type: string;
  value: string;
}

export interface SubscriptionPlan {
  planId: string;
  name: string;
  image: string;
  description: string;
  price: number;
  currency: string;
  deliveryFrequency: string;
  includes: string[];
  shippingAreas: string;
  specifications: Specification[];
  descuentoTransferencia?: number;
  descuentoEfectivo?: number;
  activo?: boolean;
}

export interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  clubName: string;
  detailsLink?: string;
  promoEspecial?: string;
}

const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({ plan, clubName, detailsLink, promoEspecial }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullIncludes, setShowFullIncludes] = useState(false);
  const [showFullSpecs, setShowFullSpecs] = useState(false);

  const descuento = Math.max(plan.descuentoTransferencia || 0, plan.descuentoEfectivo || 0);
  const precioFinal = plan.price * (1 - descuento / 100);

  const handleAddToWishlist = () => {
    alert(`"${plan.name}" de ${clubName} añadido a tu lista de deseos.`);
  };

  return (
    <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col animate-fadeInUp hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      {!plan.activo && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
          Inactivo
        </div>
      )}
      {descuento > 0 && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
          -{descuento}%
        </div>
      )}
      <div className="relative">
        <img src={plan.image} alt={plan.name} className="w-full h-48 object-cover" />
        <button
          onClick={handleAddToWishlist}
          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md text-gray-500 hover:text-red-500 hover:scale-110 transition-all duration-200"
          aria-label={`Añadir ${plan.name} a lista de deseos`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-600 text-sm mb-3">Frecuencia: <span className="font-semibold">{plan.deliveryFrequency}</span></p>
       
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed">
            {showFullDescription ? plan.description : `${plan.description.substring(0, 120)}...`}
            {plan.description.length > 120 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-blue-500 hover:underline ml-1 text-xs"
              >
                {showFullDescription ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </p>
        </div>

        <div className="mb-4">
          <h4 className="text-md font-semibold text-gray-800 mb-2">¿Qué incluye?</h4>
          <ul className="list-disc list-inside text-gray-700 text-sm">
            {plan.includes.slice(0, showFullIncludes ? plan.includes.length : 2).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
            {plan.includes.length > 2 && (
              <button
                onClick={() => setShowFullIncludes(!showFullIncludes)}
                className="text-blue-500 hover:underline ml-1 text-xs"
              >
                {showFullIncludes ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </ul>
        </div>

        {plan.specifications && plan.specifications.length > 0 && (
          <div className="mb-4">
            <h4 className="text-md font-semibold text-gray-800 mb-2">Especificaciones:</h4>
            <div className="flex flex-wrap gap-2 text-sm">
              {plan.specifications.slice(0, showFullSpecs ? plan.specifications.length : 3).map((spec, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                  {spec.type}: {spec.value}
                </span>
              ))}
              {plan.specifications.length > 3 && (
                <button
                  onClick={() => setShowFullSpecs(!showFullSpecs)}
                  className="text-blue-500 hover:underline ml-1 text-xs"
                >
                  {showFullSpecs ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mb-4">
          <h4 className="text-md font-semibold text-gray-800 mb-2">Zonas de Envío:</h4>
          <p className="text-gray-700 text-sm">{plan.shippingAreas}</p>
        </div>

        {promoEspecial && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <p className="text-purple-800 font-semibold text-sm">{promoEspecial}</p>
          </div>
        )}

        <div className="mt-auto flex justify-between items-center border-t pt-4">
          <div>
            <span className={`text-3xl font-bold ${descuento > 0 ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
              {plan.currency} {plan.price.toLocaleString('es-AR')}
            </span>
            {descuento > 0 && (
              <span className="text-3xl font-bold text-green-600 ml-2">
                {plan.currency} {precioFinal.toLocaleString('es-AR')}
              </span>
            )}
            {descuento > 0 && (
              <p className="text-xs text-gray-500">Ahorras {descuento}%</p>
            )}
          </div>
          {detailsLink ? (
            <Link
              to={detailsLink}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-extrabold text-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md"
            >
              Ver Detalles
            </Link>
          ) : (
            <button
              disabled
              className="bg-gray-400 text-white px-6 py-3 rounded-lg font-extrabold text-md cursor-not-allowed"
            >
              Ver Detalles
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlanCard;
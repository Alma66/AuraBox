import React from 'react';
import { SubscriptionPlan } from '../../types/club';

interface PlanCardProps {
  plan: SubscriptionPlan;
  onRemove: () => void;
  onAddToCart?: () => void; 
  isInCart?: boolean; 
  className?: string;
}

const PlanCard: React.FC<PlanCardProps> = ({ 
  plan, 
  onRemove, 
  onAddToCart, 
  isInCart = false, 
  className = '' 
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200 ${className}`}>
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50">
        <img 
          src={plan.image || '/assets/placeholder-plan.jpg'} 
          alt={plan.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          {isInCart ? 'En Carrito' : 'Favorito'}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{plan.name}</h3>
        <p className="text-gray-600 mb-3 line-clamp-2">{plan.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-blue-600">
            ${plan.price.toLocaleString()} {plan.currency}
          </div>
          <span className="text-sm text-green-600 font-semibold">
            {plan.deliveryFrequency} • Envío Gratis
          </span>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Incluye:</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            {plan.includes.slice(0, 3).map((item, idx) => (
              <li key={idx} className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {item}
              </li>
            ))}
            {plan.includes.length > 3 && (
              <li className="text-xs text-gray-500">... y más</li>
            )}
          </ul>
        </div>

        <div className="flex space-x-2">
          {onAddToCart && !isInCart && (
            <button
              onClick={onAddToCart}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
            >
              Agregar al Carrito
            </button>
          )}
          {isInCart && (
            <button
              onClick={onRemove}
              className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200 font-semibold"
            >
              Eliminar del Carrito
            </button>
          )}
          {!isInCart && (
            <button
              onClick={onRemove}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200 font-semibold"
            >
              Quitar Favorito
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanCard;
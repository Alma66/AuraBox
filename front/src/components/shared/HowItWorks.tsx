import React from 'react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: '🔍', 
      title: 'Explora y Descubre',
      description: 'Navega por nuestro catálogo de clubes, filtrando por categoría, precio o intereses. Encuentra la experiencia perfecta para ti.'
    },
    {
      icon: '📦',
      title: 'Suscríbete Fácilmente',
      description: 'Elige tu club favorito y suscríbete en pocos pasos. Pagos seguros y gestión transparente desde tu panel de usuario.'
    },
    {
      icon: '🎁',
      title: 'Recibe tu Sorpresa',
      description: 'Espera tu caja en la puerta de tu casa. Cada mes, una nueva experiencia curada con amor y dedicación.'
    },
    {
      icon: '💬',
      title: 'Comparte y Conecta',
      description: 'Deja reseñas, interactúa con otros suscriptores y forma parte de una comunidad apasionada por las experiencias únicas.'
    }
  ];

  return (
    <div className="py-16 bg-gray-50 rounded-xl shadow-inner">
      <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center animate-fadeInUp">¿Cómo funciona AuraBox?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-8">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg shadow-md p-6 text-center flex flex-col items-center 
                       transform transition-all duration-300 hover:scale-[1.03] hover:shadow-xl animate-slideInUp"
            style={{ animationDelay: `${index * 100}ms` }} 
          >
            <div className="text-5xl mb-4 p-4 bg-blue-100 rounded-full inline-block shadow-inner">{step.icon}</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{step.title}</h3>
            <p className="text-gray-600 text-base">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
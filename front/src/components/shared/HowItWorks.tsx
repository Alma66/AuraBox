import React from 'react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: '🔍',
      title: 'Explorá y Descubrí',
      description: 'Navegá por nuestro catálogo de clubes, filtrando por categoría, precio o intereses. Encontrá la experiencia perfecta para vos.'
    },
    {
      icon: '📦',
      title: 'Suscribite Fácilmente',
      description: 'Elegí tu club favorito y suscribite en pocos pasos. Pagos seguros y gestión transparente desde tu panel de usuario.'
    },
    {
      icon: '🎁',
      title: 'Recibí tu Sorpresa',
      description: 'Esperá tu caja en la puerta de tu casa. Cada mes, una nueva experiencia curada con amor y dedicación.'
    },
    {
      icon: '💬',
      title: 'Compartí y Conectá',
      description: 'Dejá reseñas, interactuá con otros suscriptores y formá parte de una comunidad apasionada por las experiencias únicas.'
    }
  ];

  return (
    <div className="py-16 bg-white rounded-2xl shadow-aurora-sm border border-aurora-navy/5">
      <span className="section-eyebrow block text-center">El camino</span>
      <h2 className="font-display text-4xl font-bold text-aurora-navy mb-12 text-center animate-fadeInUp">¿Cómo funciona AuraBox?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className="relative bg-aurora-cream rounded-xl p-6 text-center flex flex-col items-center
                       transform transition-all duration-300 hover:scale-[1.03] hover:shadow-aurora-sm animate-slideInUp"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span className="absolute top-3 right-4 font-display text-3xl font-bold text-aurora-navy/10">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="text-5xl mb-4 p-4 bg-aurora-gold/15 rounded-full inline-block">{step.icon}</div>
            <h3 className="font-display text-xl font-semibold text-aurora-navy mb-3">{step.title}</h3>
            <p className="text-aurora-navy/65 text-base">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
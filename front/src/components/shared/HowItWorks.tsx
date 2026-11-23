import React from 'react';
import Reveal from '../common/Reveal';

const steps = [
  {
    icon: '🔍',
    title: 'Explorá y descubrí',
    description: 'Navegá por el catálogo de clubes y filtrá por categoría, calificación o intereses hasta encontrar el tuyo.',
    tone: 'from-aurora-terracotta to-aurora-coral',
  },
  {
    icon: '📦',
    title: 'Suscribite fácil',
    description: 'Elegí tu plan y suscribite en pocos pasos, con pagos seguros y todo gestionado desde tu panel.',
    tone: 'from-aurora-navy to-aurora-navyLight',
  },
  {
    icon: '🎁',
    title: 'Recibí tu sorpresa',
    description: 'Tu caja llega a tu puerta cada mes y podés seguir el envío en todo momento.',
    tone: 'from-aurora-gold to-aurora-sun',
  },
  {
    icon: '💬',
    title: 'Compartí y conectá',
    description: 'Dejá tu reseña y sumate a una comunidad que disfruta de las experiencias únicas.',
    tone: 'from-aurora-teal to-aurora-navyLight',
  },
];

const HowItWorks: React.FC = () => (
  <div>
    <div className="mx-auto mb-14 max-w-2xl text-center">
      <span className="section-eyebrow">El camino</span>
      <h2 className="font-display text-4xl font-medium text-aurora-navy md:text-5xl">¿Cómo funciona AuraBox?</h2>
      <p className="mt-4 text-lg text-aurora-navy/60">Cuatro pasos simples entre vos y tu próxima caja sorpresa.</p>
    </div>

    <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div className="pointer-events-none absolute left-[12%] right-[12%] top-12 hidden border-t-2 border-dashed border-aurora-terracotta/30 lg:block" />
      {steps.map((step, index) => (
        <Reveal key={step.title} delay={index * 120} className="h-full">
          <div className="group relative flex h-full flex-col items-center rounded-3xl bg-white p-7 text-center shadow-aurora-sm ring-1 ring-aurora-navy/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-aurora-lg">
            <div
              className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-3xl shadow-aurora-sm transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 ${step.tone}`}
            >
              <span aria-hidden="true">{step.icon}</span>
              <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white font-display text-sm font-bold text-aurora-navy shadow-aurora-sm">
                {index + 1}
              </span>
            </div>
            <h3 className="mt-5 font-display text-2xl font-medium text-aurora-navy">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-aurora-navy/65">{step.description}</p>
          </div>
        </Reveal>
      ))}
    </div>
  </div>
);

export default HowItWorks;
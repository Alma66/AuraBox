import React from 'react';
import { Link } from 'react-router-dom';

const AboutUsPage: React.FC = () => {
  const values = [
    {
      title: 'Pasión',
      description: 'Creemos en los productos hechos con amor y en la emoción de la sorpresa mensual.',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      ),
    },
    {
      title: 'Comunidad',
      description: 'Conectamos emprendedores y suscriptores, construyendo lazos que duran en el tiempo.',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-4.13a4 4 0 100-8 4 4 0 000 8zm7 4v2m-14-2v2m7-6v8" />
      ),
    },
    {
      title: 'Transparencia',
      description: 'Claridad en cada paso, desde el pago hasta la entrega, para generar confianza real.',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
    },
  ];

  const stats = [
    { value: '+120', label: 'Clubes activos' },
    { value: '+15.000', label: 'Cajas entregadas' },
    { value: '4.7★', label: 'Rating promedio' },
    { value: '24', label: 'Provincias con envíos' },
  ];

  const steps = [
    { title: 'Descubrís', text: 'Explorás clubes por categoría, rating o lo que más te guste.' },
    { title: 'Te suscribís', text: 'Elegís tu plan y forma de pago en segundos.' },
    { title: 'Recibís', text: 'Tu caja llega dentro de la ventana de envío del club.' },
    { title: 'Repetís', text: 'Cada mes, una nueva sorpresa. Pausás o cancelás cuando quieras.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-aurora-navy via-aurora-navyDark to-aurora-terracottaDark text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-aurora-gold rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-aurora-terracotta rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <span className="inline-block bg-white/15 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            Hecho en Argentina 🇦🇷
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-bold leading-tight mb-6">
            Conectamos emprendedores<br className="hidden sm:block" /> con quienes buscan algo distinto
          </h1>
          <p className="text-lg sm:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed">
            AuraBox es la plataforma que transforma clubes de suscripción en comunidades vibrantes y sostenibles.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/explore"
              className="bg-white text-aurora-navy px-8 py-3 rounded-full font-bold hover:bg-aurora-cream transition-colors shadow-lg"
            >
              Explorar clubes
            </Link>
            <Link
              to="/register"
              className="border-2 border-white/60 text-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition-colors"
            >
              Registrar mi club
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-aurora-navy/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-3xl sm:text-4xl font-bold text-aurora-terracotta">{stat.value}</p>
              <p className="text-sm text-aurora-navy/50 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-aurora-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10">
          <div className="bg-white rounded-2xl p-8 shadow-aurora-sm border border-aurora-navy/5">
            <div className="w-12 h-12 rounded-xl bg-aurora-navy/10 flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-aurora-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-aurora-navy mb-3">Nuestra Misión</h2>
            <p className="text-aurora-navy/65 leading-relaxed">
              Empoderar a los emprendedores argentinos con las herramientas y el soporte necesario para
              profesionalizar y escalar sus clubes de suscripción, mientras creamos una experiencia de
              descubrimiento única para los suscriptores.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-aurora-sm border border-aurora-navy/5">
            <div className="w-12 h-12 rounded-xl bg-aurora-gold/15 flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-aurora-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-aurora-navy mb-3">Nuestra Visión</h2>
            <p className="text-aurora-navy/65 leading-relaxed">
              Ser la plataforma líder en Latinoamérica para clubes de suscripción, reconocida por su innovación,
              su comunidad y su compromiso con el crecimiento sostenible de los pequeños y medianos emprendimientos.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="section-eyebrow block text-center">El camino</span>
          <h2 className="font-display text-3xl font-bold text-center text-aurora-navy mb-3">Cómo funciona</h2>
          <p className="text-center text-aurora-navy/50 mb-14 max-w-xl mx-auto">
            Un camino simple, del descubrimiento a la puerta de tu casa.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="w-10 h-10 rounded-full bg-aurora-terracotta text-white font-bold flex items-center justify-center mb-4">
                  {i + 1}
                </div>
                <h3 className="font-display font-bold text-aurora-navy mb-1">{step.title}</h3>
                <p className="text-sm text-aurora-navy/50 leading-relaxed">{step.text}</p>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-full w-8 border-t-2 border-dashed border-aurora-navy/15" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-aurora-cream">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-center text-aurora-navy mb-14">Nuestros Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="bg-white rounded-2xl p-8 shadow-aurora-sm border border-aurora-navy/5 hover:shadow-aurora hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-aurora-terracotta to-aurora-gold flex items-center justify-center mb-5">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {value.icon}
                  </svg>
                </div>
                <h3 className="font-display text-xl font-bold text-aurora-navy mb-2">{value.title}</h3>
                <p className="text-aurora-navy/65 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-aurora-navy to-aurora-navyDark text-white text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">¿Tenés un producto que la gente amaría recibir cada mes?</h2>
          <p className="text-white/85 mb-8">
            Sumate a AuraBox y llegá a miles de suscriptores en toda Argentina.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-aurora-navy px-10 py-3.5 rounded-full font-bold hover:bg-aurora-cream transition-colors shadow-lg"
          >
            Registrá tu club hoy
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;
import React from 'react';
import { Link } from 'react-router-dom';

const WorkWithUsPage: React.FC = () => (
  <div className="min-h-screen bg-aurora-cream py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
    <div className="absolute -top-32 -right-20 w-96 h-96 bg-aurora-gold/10 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-aurora-terracotta/10 rounded-full blur-3xl pointer-events-none" />

    <div className="max-w-5xl mx-auto relative">
      <div className="text-center mb-14 animate-fadeInUp">
        <span className="section-eyebrow block">Trabajá con nosotros</span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-aurora-navy mb-4 leading-tight">
          ¿Cómo querés <span className="text-aurora-terracotta">sumarte</span> a AuraBox?
        </h1>
        <p className="text-lg text-aurora-navy/60 max-w-2xl mx-auto">
          Elegí el camino que mejor se ajusta a vos. Son dos caminos distintos y cada uno tiene su propio proceso.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link
          to="/work-with-us/job-application"
          className="group card-surface shadow-aurora p-8 sm:p-10 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-terracotta"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-aurora-navy text-aurora-cream mb-6 transition-transform duration-300 group-hover:scale-110">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </span>
          <h2 className="font-display text-2xl font-bold text-aurora-navy mb-2">Quiero trabajar en AuraBox</h2>
          <p className="text-aurora-navy/65 leading-relaxed mb-6 flex-grow">
            Sos una persona que quiere formar parte del equipo de la empresa: tecnología, diseño, atención, operaciones y más.
          </p>
          <span className="inline-flex items-center font-semibold text-aurora-terracotta">
            Enviar mi postulación
            <svg className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </Link>

        <Link
          to="/register/entrepreneur"
          className="group card-surface shadow-aurora p-8 sm:p-10 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-terracotta"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-aurora-terracotta text-white mb-6 transition-transform duration-300 group-hover:scale-110">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </span>
          <h2 className="font-display text-2xl font-bold text-aurora-navy mb-2">Tengo un club y quiero estar en AuraBox</h2>
          <p className="text-aurora-navy/65 leading-relaxed mb-6 flex-grow">
            Sos emprendedor/a y querés publicar tu club de suscripción en la plataforma. Creás una cuenta de emprendedor, no de cliente, y el equipo revisa tu club antes de publicarlo.
          </p>
          <span className="inline-flex items-center font-semibold text-aurora-terracotta">
            Registrar mi club
            <svg className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </Link>
      </div>

      <p className="text-center text-sm text-aurora-navy/50 mt-10">
        ¿Solo querés comprar cajas?{' '}
        <Link to="/register" className="font-semibold text-aurora-terracotta hover:text-aurora-terracottaDark">
          Creá tu cuenta de cliente
        </Link>
        . ¿Tenés dudas?{' '}
        <Link to="/contact" className="font-semibold text-aurora-terracotta hover:text-aurora-terracottaDark">
          Escribinos
        </Link>
        .
      </p>
    </div>
  </div>
);

export default WorkWithUsPage;
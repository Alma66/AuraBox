import React from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/common/Reveal';

const teamAreas = ['Tecnología', 'Diseño', 'Atención al cliente', 'Operaciones'];

const clubSteps = [
  { title: 'Creá tu cuenta de emprendedor', text: 'Es una cuenta distinta a la de cliente, pensada para gestionar un club.' },
  { title: 'Completá tu perfil y tu club', text: 'Cargá los datos de tu emprendimiento, tu logo y cómo funciona tu club.' },
  { title: 'Revisamos tu club', text: 'El equipo de AuraBox lo revisa antes de publicarlo en el catálogo.' },
  { title: 'Publicá planes y empezá a vender', text: 'Definí tus planes y cajas, y gestioná todo desde tu panel.' },
];

const WorkWithUsPage: React.FC = () => (
  <div className="min-h-screen bg-aurora-cream">
    <section className="hero-mesh grain relative isolate overflow-hidden px-4 pb-36 pt-16 text-center text-white">
      <div className="pointer-events-none absolute -right-16 -top-16 -z-10 h-72 w-72 animate-blobMove rounded-full bg-aurora-sun/30 blur-3xl" />
      <div
        className="pointer-events-none absolute -bottom-20 -left-16 -z-10 h-72 w-72 animate-blobMove rounded-full bg-aurora-coral/40 blur-3xl"
        style={{ animationDelay: '-8s' }}
      />
      <span className="glass mb-5 inline-block animate-fadeInUp rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
        Trabajá con nosotros
      </span>
      <h1 className="mx-auto max-w-3xl animate-fadeInUp font-display text-4xl font-normal leading-[1.05] md:text-6xl">
        ¿Cómo querés <em className="italic text-aurora-goldLight">sumarte</em> a AuraBox?
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">
        Elegí el camino que mejor se ajusta a vos. Son dos caminos distintos y cada uno tiene su propio proceso.
      </p>
      <svg className="absolute bottom-[-1px] left-0 block h-10 w-full text-aurora-cream md:h-14" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path fill="currentColor" d="M0,48 C240,96 480,0 720,32 C960,64 1200,96 1440,40 L1440,80 L0,80 Z" />
      </svg>
    </section>

    <div className="mx-auto -mt-20 max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Reveal className="h-full">
          <Link
            to="/work-with-us/job-application"
            className="group flex h-full flex-col rounded-3xl bg-white p-8 shadow-aurora-lg ring-1 ring-aurora-navy/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-aurora-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-terracotta sm:p-10"
          >
            <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-aurora-navy to-aurora-navyLight text-white transition-transform duration-300 group-hover:scale-110">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <h2 className="font-display text-3xl font-medium text-aurora-navy">Quiero trabajar en AuraBox</h2>
            <p className="mt-3 flex-grow leading-relaxed text-aurora-navy/65">
              Sos una persona que quiere formar parte del equipo de la empresa. Contanos quién sos y en qué área te gustaría aportar.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {teamAreas.map((area) => (
                <span key={area} className="rounded-full bg-aurora-cream px-3 py-1 text-xs font-semibold text-aurora-navy/70">
                  {area}
                </span>
              ))}
            </div>
            <span className="mt-7 inline-flex items-center font-semibold text-aurora-terracotta">
              Enviar mi postulación
              <svg className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
        </Reveal>

        <Reveal delay={100} className="h-full">
          <Link
            to="/register/entrepreneur"
            className="group flex h-full flex-col rounded-3xl bg-white p-8 shadow-aurora-lg ring-1 ring-aurora-navy/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-aurora-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-aurora-terracotta sm:p-10"
          >
            <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-aurora-terracotta to-aurora-coral text-white transition-transform duration-300 group-hover:scale-110">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </span>
            <h2 className="font-display text-3xl font-medium text-aurora-navy">Tengo un club y quiero estar en AuraBox</h2>
            <p className="mt-3 flex-grow leading-relaxed text-aurora-navy/65">
              Sos emprendedor o emprendedora y querés publicar tu club de suscripción. Creás una cuenta de emprendedor, no de cliente, y el equipo revisa tu club antes de publicarlo.
            </p>
            <span className="mt-7 inline-flex items-center font-semibold text-aurora-terracotta">
              Registrar mi club
              <svg className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
        </Reveal>
      </div>

      <section className="mt-24">
        <Reveal>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-aurora-terracotta">Si tenés un club</span>
            <h2 className="font-display text-4xl font-medium text-aurora-navy md:text-5xl">Así es el proceso</h2>
          </div>
        </Reveal>
        <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-[12%] right-[12%] top-8 hidden border-t-2 border-dashed border-aurora-terracotta/30 lg:block" />
          {clubSteps.map((step, index) => (
            <Reveal key={step.title} delay={index * 100} className="h-full">
              <div className="relative h-full rounded-3xl bg-white p-6 text-center shadow-aurora-sm ring-1 ring-aurora-navy/5">
                <span className="relative z-10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-aurora-terracotta font-display text-xl text-white">
                  {index + 1}
                </span>
                <h3 className="font-display text-xl font-medium text-aurora-navy">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-aurora-navy/60">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <p className="mt-14 text-center text-sm text-aurora-navy/55">
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
import React from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/common/Reveal';

interface IconProps {
  d: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ d, className = 'h-6 w-6' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

const ICONS = {
  heart: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  users: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-4.13a4 4 0 100-8 4 4 0 000 8zm7 4v2m-14-2v2m7-6v8',
  check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  bolt: 'M13 10V3L4 14h7v7l9-11h-7z',
  shield: 'M12 3l8 3v6c0 4.5-3.2 8.2-8 9-4.8-.8-8-4.5-8-9V6l8-3z',
  box: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  chart: 'M4 19V5m0 14h16M8 15v-4m4 4V8m4 7v-6',
  truck: 'M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 18.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17 18.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  star: 'M11.48 3.5a.56.56 0 011.04 0l2.13 5.11a.56.56 0 00.48.35l5.52.44c.5.04.7.66.32.99l-4.2 3.6a.56.56 0 00-.18.56l1.28 5.39a.56.56 0 01-.84.61l-4.73-2.89a.56.56 0 00-.58 0l-4.73 2.89a.56.56 0 01-.84-.61l1.28-5.39a.56.56 0 00-.18-.56l-4.2-3.6a.56.56 0 01.32-.99l5.52-.44a.56.56 0 00.48-.35L11.48 3.5z',
  bell: 'M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0',
  phone: 'M8 3h8a1 1 0 011 1v16a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1zm4 15h.01',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  card: 'M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm0 3h18',
  eye: 'M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
  flag: 'M5 21V4m0 0h11l-1.5 4L16 12H5',
};

const highlights = [
  { icon: ICONS.flag, title: '100% argentino', text: 'Emprendedores y suscriptores de todo el país.' },
  { icon: ICONS.card, title: 'Pago seguro', text: 'Tarjetas y Mercado Pago.' },
  { icon: ICONS.truck, title: 'Envíos con seguimiento', text: 'Mirá el estado de cada caja.' },
  { icon: ICONS.check, title: 'Sin permanencia', text: 'Pausás o cancelás cuando quieras.' },
];

const problems = [
  {
    who: 'Si sos suscriptor',
    text: 'Encontrar un club bueno suele ser cuestión de suerte: cada emprendimiento vende por su lado, con su propia web, su propio pago y su propia forma de avisarte. Con AuraBox encontrás todo en un solo lugar y comparás antes de elegir.',
  },
  {
    who: 'Si sos emprendedor',
    text: 'Armar un club implica llevar suscripciones, stock, envíos, cobros y clientes en planillas y chats. Con AuraBox tenés un panel para gestionar todo eso sin tener que programar nada.',
  },
];

const forSubscribers = [
  { icon: ICONS.search, title: 'Descubrí y compará', text: 'Explorá clubes por categoría, calificación y cantidad de reseñas.' },
  { icon: ICONS.card, title: 'Suscribite fácil', text: 'Elegí un plan y pagá de forma segura, sin vueltas.' },
  { icon: ICONS.truck, title: 'Seguí tu caja', text: 'Consultá el estado de cada envío desde tu cuenta.' },
  { icon: ICONS.star, title: 'Opiná y guardá', text: 'Dejá tu reseña y guardá tus clubes favoritos en tu lista.' },
  { icon: ICONS.bell, title: 'Avisos a tiempo', text: 'Recibí notificaciones sobre tus suscripciones y renovaciones.' },
  { icon: ICONS.phone, title: 'En tu celular', text: 'También podés usar AuraBox desde la app para Android.' },
];

const forEntrepreneurs = [
  { icon: ICONS.box, title: 'Planes y cajas', text: 'Definí tus planes, tus cajas y lo que incluye cada una.' },
  { icon: ICONS.users, title: 'Clientes y suscripciones', text: 'Mirá quién está suscripto y el historial de cada cliente.' },
  { icon: ICONS.truck, title: 'Envíos y repartidores', text: 'Asigná entregas, seguí su estado y organizá a tus riders.' },
  { icon: ICONS.box, title: 'Inventario', text: 'Controlá stock, proveedores y pedidos de reposición.' },
  { icon: ICONS.chart, title: 'Finanzas y métricas', text: 'Seguí movimientos, rentabilidad y estadísticas de tu club.' },
  { icon: ICONS.eye, title: 'Visibilidad', text: 'Tu club aparece en el catálogo y puede recibir reseñas de la comunidad.' },
];

const steps = [
  { title: 'Descubrís', text: 'Explorás clubes por categoría, calificación o lo que más te guste.' },
  { title: 'Te suscribís', text: 'Elegís tu plan y pagás de forma segura.' },
  { title: 'Recibís', text: 'Tu caja llega dentro de la ventana de envío del club.' },
  { title: 'Repetís', text: 'Cada mes, una nueva sorpresa. Pausás o cancelás cuando quieras.' },
];

const values = [
  { icon: ICONS.heart, title: 'Pasión', text: 'Creemos en los productos hechos con amor y en la emoción de la sorpresa mensual.' },
  { icon: ICONS.users, title: 'Comunidad', text: 'Conectamos emprendedores y suscriptores, y construimos lazos que duran.' },
  { icon: ICONS.eye, title: 'Transparencia', text: 'Claridad en cada paso, desde el pago hasta la entrega, para generar confianza real.' },
  { icon: ICONS.flag, title: 'Compromiso local', text: 'Impulsamos a pequeños y medianos emprendimientos argentinos.' },
  { icon: ICONS.bolt, title: 'Simplicidad', text: 'Herramientas fáciles de usar, tanto para quien compra como para quien vende.' },
  { icon: ICONS.shield, title: 'Seguridad', text: 'Cuidamos tus datos y tus pagos con las mejores prácticas disponibles.' },
];

const faqs = [
  {
    q: '¿Cuánto cuesta usar AuraBox como suscriptor?',
    a: 'Explorar clubes es gratis. Pagás únicamente el plan del club que elijas, al precio que figura en su página.',
  },
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí. Podés pausar o cancelar tu suscripción desde tu cuenta, sin permanencia mínima.',
  },
  {
    q: '¿Cómo registro mi club?',
    a: 'Creás tu cuenta de emprendedor, completás los datos de tu club y cargás tus planes y cajas. Desde ahí podés gestionar todo desde tu panel.',
  },
  {
    q: '¿Dónde veo más respuestas?',
    a: 'En nuestras preguntas frecuentes o escribiéndonos desde la página de contacto.',
  },
];

const eyebrow = 'mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-aurora-terracotta';

const AboutUsPage: React.FC = () => (
  <div className="min-h-screen bg-aurora-cream">
    <section className="hero-mesh grain relative isolate overflow-hidden text-white">
      <div className="pointer-events-none absolute -right-16 -top-16 -z-10 h-80 w-80 animate-blobMove rounded-full bg-aurora-sun/30 blur-3xl" />
      <div
        className="pointer-events-none absolute -bottom-24 -left-16 -z-10 h-80 w-80 animate-blobMove rounded-full bg-aurora-coral/40 blur-3xl"
        style={{ animationDelay: '-9s' }}
      />
      <div className="mx-auto max-w-5xl px-4 pb-28 pt-20 text-center sm:px-6 lg:px-8">
        <span className="glass mb-6 inline-block animate-fadeInUp rounded-full px-4 py-1.5 text-sm font-medium">Hecho en Argentina 🇦🇷</span>
        <h1 className="animate-fadeInUp font-display text-4xl font-normal leading-[1.05] sm:text-6xl">
          Conectamos emprendedores con quienes buscan <em className="italic text-aurora-goldLight">algo distinto</em>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
          AuraBox es la plataforma que reúne clubes de suscripción argentinos en un solo lugar y le da a cada emprendedor las herramientas para hacerlos crecer.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            to="/explore"
            className="btn-shine inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 font-semibold text-aurora-terracottaDark shadow-aurora-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-aurora-cream"
          >
            Explorar clubes
          </Link>
          <Link
            to="/register/entrepreneur"
            className="glass inline-flex items-center justify-center rounded-full px-8 py-3.5 font-semibold text-white transition-colors hover:bg-white/25"
          >
            Registrar mi club
          </Link>
        </div>
      </div>
      <svg className="absolute bottom-[-1px] left-0 block h-10 w-full text-aurora-cream md:h-14" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path fill="currentColor" d="M0,48 C240,96 480,0 720,32 C960,64 1200,96 1440,40 L1440,80 L0,80 Z" />
      </svg>
    </section>

    <div className="relative z-10 mx-auto -mt-6 max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 divide-aurora-navy/10 rounded-3xl bg-white shadow-aurora-lg ring-1 ring-aurora-navy/5 md:grid-cols-4 md:divide-x">
        {highlights.map((item) => (
          <div key={item.title} className="flex flex-col items-center px-4 py-6 text-center">
            <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-aurora-cream text-aurora-terracotta">
              <Icon d={item.icon} />
            </span>
            <b className="text-sm font-semibold text-aurora-navy">{item.title}</b>
            <span className="mt-1 text-xs text-aurora-navy/60">{item.text}</span>
          </div>
        ))}
      </div>
    </div>

    <section className="mx-auto max-w-5xl px-4 pt-24 sm:px-6 lg:px-8">
      <Reveal>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className={eyebrow}>Por qué existimos</span>
          <h2 className="font-display text-4xl font-medium text-aurora-navy md:text-5xl">Un solo lugar para los dos lados</h2>
          <p className="mt-4 text-lg text-aurora-navy/60">
            Los clubes de suscripción son una forma genial de descubrir productos, pero hoy están dispersos. Nos propusimos ordenarlos.
          </p>
        </div>
      </Reveal>
      <div className="grid gap-6 md:grid-cols-2">
        {problems.map((item, index) => (
          <Reveal key={item.who} delay={index * 100} className="h-full">
            <div className="h-full rounded-3xl bg-white p-8 shadow-aurora-sm ring-1 ring-aurora-navy/5">
              <h3 className="font-display text-2xl font-medium text-aurora-navy">{item.who}</h3>
              <p className="mt-3 leading-relaxed text-aurora-navy/65">{item.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>

    <section className="mx-auto max-w-5xl px-4 pt-20 sm:px-6 lg:px-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Reveal className="h-full">
          <div className="h-full rounded-3xl bg-gradient-to-br from-aurora-navy to-aurora-navyLight p-8 text-white shadow-aurora">
            <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Icon d={ICONS.bolt} />
            </span>
            <h2 className="font-display text-3xl font-medium">Nuestra misión</h2>
            <p className="mt-3 leading-relaxed text-white/80">
              Empoderar a los emprendedores argentinos con las herramientas y el soporte necesarios para profesionalizar y escalar sus clubes de suscripción, mientras creamos una experiencia de descubrimiento única para los suscriptores.
            </p>
          </div>
        </Reveal>
        <Reveal delay={100} className="h-full">
          <div className="h-full rounded-3xl bg-gradient-to-br from-aurora-terracotta to-aurora-coral p-8 text-white shadow-aurora">
            <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <Icon d={ICONS.eye} />
            </span>
            <h2 className="font-display text-3xl font-medium">Nuestra visión</h2>
            <p className="mt-3 leading-relaxed text-white/90">
              Ser la plataforma de referencia para clubes de suscripción en Latinoamérica, reconocida por su innovación, su comunidad y su compromiso con el crecimiento sostenible de los pequeños y medianos emprendimientos.
            </p>
          </div>
        </Reveal>
      </div>
    </section>

    <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-6 lg:px-8">
      <Reveal>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className={eyebrow}>Qué ofrecemos</span>
          <h2 className="font-display text-4xl font-medium text-aurora-navy md:text-5xl">Pensado para quien compra y para quien vende</h2>
        </div>
      </Reveal>
      <div className="grid gap-8 lg:grid-cols-2">
        <Reveal className="h-full">
          <div className="h-full rounded-3xl bg-white p-8 shadow-aurora-sm ring-1 ring-aurora-navy/5">
            <span className="inline-block rounded-full bg-aurora-terracotta/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-aurora-terracottaDark">
              Para suscriptores
            </span>
            <ul className="mt-6 space-y-5">
              {forSubscribers.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-aurora-terracotta to-aurora-coral text-white">
                    <Icon d={item.icon} className="h-5 w-5" />
                  </span>
                  <span>
                    <b className="block font-semibold text-aurora-navy">{item.title}</b>
                    <span className="text-sm leading-relaxed text-aurora-navy/60">{item.text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link to="/explore" className="btn-primary mt-8">
              Explorar clubes
            </Link>
          </div>
        </Reveal>
        <Reveal delay={100} className="h-full">
          <div className="h-full rounded-3xl bg-white p-8 shadow-aurora-sm ring-1 ring-aurora-navy/5">
            <span className="inline-block rounded-full bg-aurora-navy/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-aurora-navy">
              Para emprendedores
            </span>
            <ul className="mt-6 space-y-5">
              {forEntrepreneurs.map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-aurora-navy to-aurora-navyLight text-white">
                    <Icon d={item.icon} className="h-5 w-5" />
                  </span>
                  <span>
                    <b className="block font-semibold text-aurora-navy">{item.title}</b>
                    <span className="text-sm leading-relaxed text-aurora-navy/60">{item.text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link to="/register/entrepreneur" className="btn-secondary mt-8">
              Registrar mi club
            </Link>
          </div>
        </Reveal>
      </div>
    </section>

    <section className="mx-auto max-w-5xl px-4 pt-24 sm:px-6 lg:px-8">
      <Reveal>
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className={eyebrow}>El camino</span>
          <h2 className="font-display text-4xl font-medium text-aurora-navy md:text-5xl">Cómo funciona</h2>
          <p className="mt-4 text-lg text-aurora-navy/60">Un camino simple, del descubrimiento a la puerta de tu casa.</p>
        </div>
      </Reveal>
      <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="pointer-events-none absolute left-[12%] right-[12%] top-8 hidden border-t-2 border-dashed border-aurora-terracotta/30 lg:block" />
        {steps.map((step, index) => (
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

    <section className="mx-auto max-w-6xl px-4 pt-24 sm:px-6 lg:px-8">
      <Reveal>
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className={eyebrow}>Lo que nos mueve</span>
          <h2 className="font-display text-4xl font-medium text-aurora-navy md:text-5xl">Nuestros valores</h2>
        </div>
      </Reveal>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {values.map((value, index) => (
          <Reveal key={value.title} delay={(index % 3) * 90} className="h-full">
            <div className="h-full rounded-3xl bg-white p-7 shadow-aurora-sm ring-1 ring-aurora-navy/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-aurora-lg">
              <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-aurora-terracotta to-aurora-gold text-white">
                <Icon d={value.icon} className="h-7 w-7" />
              </span>
              <h3 className="font-display text-2xl font-medium text-aurora-navy">{value.title}</h3>
              <p className="mt-2 leading-relaxed text-aurora-navy/60">{value.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>

    <section className="mx-auto max-w-3xl px-4 pt-24 sm:px-6 lg:px-8">
      <Reveal>
        <div className="mb-10 text-center">
          <span className={eyebrow}>Dudas comunes</span>
          <h2 className="font-display text-4xl font-medium text-aurora-navy md:text-5xl">Preguntas rápidas</h2>
        </div>
      </Reveal>
      <div className="space-y-3">
        {faqs.map((item) => (
          <details key={item.q} className="group rounded-2xl bg-white p-5 shadow-aurora-sm ring-1 ring-aurora-navy/5 open:shadow-aurora">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-aurora-navy">
              {item.q}
              <svg className="h-5 w-5 shrink-0 text-aurora-terracotta transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-aurora-navy/65">{item.a}</p>
          </details>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-aurora-navy/60">
        ¿Querés más respuestas? Mirá las{' '}
        <Link to="/faq" className="font-semibold text-aurora-terracotta hover:underline">
          preguntas frecuentes
        </Link>{' '}
        o{' '}
        <Link to="/contact" className="font-semibold text-aurora-terracotta hover:underline">
          escribinos
        </Link>
        .
      </p>
    </section>

    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
      <Reveal>
        <div className="hero-mesh grain relative isolate overflow-hidden rounded-3xl px-6 py-16 text-center text-white shadow-aurora-lg">
          <div className="pointer-events-none absolute -right-16 -top-16 -z-10 h-72 w-72 animate-blobMove rounded-full bg-aurora-sun/30 blur-3xl" />
          <h2 className="mx-auto max-w-3xl font-display text-4xl font-normal leading-tight md:text-5xl">
            ¿Tenés un producto que la gente <em className="italic text-aurora-goldLight">amaría recibir</em> cada mes?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/85">
            Sumate a AuraBox, mostrá tu club en el catálogo y gestioná todo desde un solo panel.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/register/entrepreneur"
              className="btn-shine inline-flex items-center justify-center rounded-full bg-white px-10 py-4 text-lg font-semibold text-aurora-terracottaDark shadow-aurora-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-aurora-cream"
            >
              Registrá tu club hoy
            </Link>
            <Link
              to="/explore"
              className="glass inline-flex items-center justify-center rounded-full px-10 py-4 text-lg font-semibold text-white transition-colors hover:bg-white/25"
            >
              Ver los clubes
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  </div>
);

export default AboutUsPage;
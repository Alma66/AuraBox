import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/common/Reveal';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: '¿Qué es AuraBox y cómo funciona?',
    answer:
      'AuraBox es una plataforma que reúne clubes de suscripción de emprendedores argentinos en un solo lugar. Explorás clubes, comparás planes, te suscribís, pagás de forma segura y seguís tus envíos desde tu cuenta. Para los emprendedores, es un panel para gestionar su club.',
    category: 'General',
    keywords: ['AuraBox', 'funciona', 'qué es', 'plataforma', 'suscripción'],
  },
  {
    id: '2',
    question: '¿Qué tipo de clubes puedo encontrar?',
    answer:
      'Hay clubes de gastronomía y bebidas, lectura y cultura, belleza y cuidado personal, hogar y plantas, entre otros. Podés filtrarlos por categoría, calificación y cantidad de reseñas desde la página de exploración.',
    category: 'General',
    keywords: ['tipos de clubes', 'categorías', 'variedad', 'descubrir', 'filtros'],
  },
  {
    id: '3',
    question: '¿AuraBox tiene una aplicación móvil?',
    answer:
      'Sí, hay una app para Android. También podés usar AuraBox desde el navegador de cualquier dispositivo. Por ahora no hay versión para iOS.',
    category: 'General',
    keywords: ['app', 'móvil', 'aplicación', 'Android', 'iOS', 'celular'],
  },
  {
    id: '4',
    question: '¿Cómo me registro como suscriptor?',
    answer:
      'Tocá el botón "Registrate" del menú superior, completá tus datos básicos y listo: ya podés explorar clubes y suscribirte.',
    category: 'Suscriptores',
    keywords: ['registro', 'suscriptor', 'cuenta', 'crear'],
  },
  {
    id: '5',
    question: '¿Puedo pausar o cancelar mi suscripción?',
    answer:
      'Sí. Desde "Mis suscripciones" podés pausar o cancelar cada suscripción activa. No hay permanencia mínima.',
    category: 'Suscriptores',
    keywords: ['pausar', 'cancelar', 'suscripción', 'baja', 'permanencia'],
  },
  {
    id: '6',
    question: '¿Cómo dejo una reseña de un club?',
    answer:
      'Si tenés una suscripción activa en un club, o la cancelaste hace poco, podés dejar tu reseña y calificación desde "Mis reseñas". Es una reseña por suscripción, así las opiniones vienen de personas que realmente usaron el club.',
    category: 'Suscriptores',
    keywords: ['reseña', 'calificación', 'opinión', 'feedback'],
  },
  {
    id: '7',
    question: '¿Puedo guardar clubes o recibir recomendaciones?',
    answer:
      'Sí. Podés guardar tus clubes favoritos en tu lista de deseos, y AuraBox te sugiere clubes según tus suscripciones y tus preferencias.',
    category: 'Suscriptores',
    keywords: ['favoritos', 'wishlist', 'recomendaciones', 'intereses', 'lista de deseos'],
  },
  {
    id: '8',
    question: '¿Qué medios de pago puedo usar?',
    answer:
      'Podés pagar con Mercado Pago o con tarjeta de crédito o débito. Según lo que habilite cada club, también puede haber transferencia bancaria o efectivo contra entrega. En el checkout ves las opciones disponibles para tu compra.',
    category: 'Pagos',
    keywords: ['pago', 'métodos', 'Mercado Pago', 'tarjeta', 'transferencia', 'efectivo'],
  },
  {
    id: '9',
    question: '¿Dónde veo mis compras y pagos anteriores?',
    answer:
      'En "Historial de compras", dentro del menú de tu cuenta, encontrás todos tus pedidos con su estado.',
    category: 'Pagos',
    keywords: ['historial', 'compras', 'pedidos', 'pagos'],
  },
  {
    id: '10',
    question: '¿Cómo sigo el estado de mi envío?',
    answer:
      'Desde tu cuenta podés ver el estado de cada envío, y te avisamos con notificaciones dentro de AuraBox cuando hay novedades.',
    category: 'Entregas',
    keywords: ['envío', 'seguimiento', 'tracking', 'entrega', 'paquete', 'notificaciones'],
  },
  {
    id: '11',
    question: '¿Qué hago si hay un problema con mi entrega?',
    answer:
      'Escribinos desde la página de contacto indicando el nombre del club y tu pedido, y te ayudamos a resolverlo con el emprendedor.',
    category: 'Entregas',
    keywords: ['problema', 'entrega', 'dañado', 'retraso', 'reclamo'],
  },
  {
    id: '12',
    question: '¿Cómo registro mi club en AuraBox?',
    answer:
      'Creás una cuenta de emprendedor desde "Registrá tu club", completás tu perfil y los datos del club, y el equipo de AuraBox revisa tu club antes de publicarlo en el catálogo.',
    category: 'Emprendedores',
    keywords: ['registro', 'club', 'emprendedor', 'vender', 'publicar'],
  },
  {
    id: '13',
    question: '¿Qué herramientas tienen los emprendedores?',
    answer:
      'Un panel para gestionar planes y cajas, clientes y suscripciones, envíos y repartidores, inventario y proveedores, finanzas y estadísticas. También podés crear promociones y enviar newsletters a tus suscriptores.',
    category: 'Emprendedores',
    keywords: ['herramientas', 'panel', 'inventario', 'finanzas', 'promociones', 'newsletter', 'marketing'],
  },
  {
    id: '14',
    question: '¿Cómo contacto al soporte de AuraBox?',
    answer:
      'Podés escribirnos desde la página de contacto o consultar al asistente virtual, el botón de chat que aparece abajo a la derecha. Respondemos por correo en horario de lunes a viernes.',
    category: 'Soporte',
    keywords: ['contacto', 'soporte', 'ayuda', 'chat', 'asistente'],
  },
  {
    id: '15',
    question: '¿Dónde encuentro los términos y políticas de cada club?',
    answer:
      'Cada club tiene sus propios términos y condiciones y su política de privacidad, y los encontrás dentro del perfil de ese club.',
    category: 'Soporte',
    keywords: ['términos', 'condiciones', 'privacidad', 'políticas'],
  },
];

const explore = [
  { to: '/explore', title: 'Explorar clubes', text: 'Descubrí todos los clubes y encontrá el que más te guste.', cta: 'Ver clubes' },
  { to: '/register/entrepreneur', title: 'Registrá tu club', text: 'Mirá cómo AuraBox puede ayudarte a gestionar y hacer crecer tu club.', cta: 'Empezar' },
  { to: '/about-us', title: 'Sobre nosotros', text: 'Conocé nuestra misión, visión y los valores detrás de AuraBox.', cta: 'Leer más' },
];

const FAQPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const categories = useMemo(() => ['Todas', ...Array.from(new Set(faqData.map((item) => item.category)))], []);

  const filteredFaqs = useMemo(() => {
    const terms = searchTerm.toLowerCase().split(' ').filter(Boolean);
    return faqData.filter((faq) => {
      const matchesSearch = terms.every(
        (term) =>
          faq.question.toLowerCase().includes(term) ||
          faq.answer.toLowerCase().includes(term) ||
          faq.keywords.some((keyword) => keyword.toLowerCase().includes(term)),
      );
      const matchesCategory = selectedCategory === 'Todas' || faq.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const toggleQuestion = (id: string) => {
    setOpenQuestion((current) => (current === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-aurora-cream">
      <section className="hero-mesh grain relative isolate overflow-hidden px-4 pb-28 pt-16 text-center text-white">
        <div className="pointer-events-none absolute -right-16 -top-16 -z-10 h-72 w-72 animate-blobMove rounded-full bg-aurora-sun/30 blur-3xl" />
        <div
          className="pointer-events-none absolute -bottom-20 -left-16 -z-10 h-72 w-72 animate-blobMove rounded-full bg-aurora-coral/40 blur-3xl"
          style={{ animationDelay: '-8s' }}
        />
        <span className="glass mb-5 inline-block animate-fadeInUp rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
          ¿Tenés dudas?
        </span>
        <h1 className="mx-auto max-w-3xl animate-fadeInUp font-display text-4xl font-normal leading-[1.05] md:text-6xl">
          Preguntas <em className="italic text-aurora-goldLight">frecuentes</em>
        </h1>
        <p className="mx-auto mb-9 mt-5 max-w-xl text-lg text-white/85">
          Respuestas rápidas sobre cómo funciona AuraBox, para suscriptores y para emprendedores.
        </p>
        <div className="relative mx-auto max-w-2xl">
          <svg className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-aurora-navy/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            aria-label="Buscar en las preguntas frecuentes"
            placeholder="Buscá tu pregunta"
            className="w-full rounded-full border-0 bg-white py-4 pl-12 pr-6 text-aurora-navy shadow-aurora-lg placeholder:text-aurora-navy/40 focus:outline-none focus:ring-4 focus:ring-aurora-sun/60"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <svg className="absolute bottom-[-1px] left-0 block h-10 w-full text-aurora-cream md:h-14" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path fill="currentColor" d="M0,48 C240,96 480,0 720,32 C960,64 1200,96 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="no-scrollbar -mx-1 mb-8 flex gap-2 overflow-x-auto px-1 py-1 sm:flex-wrap sm:justify-center">
          {categories.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                aria-pressed={active}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-aurora-terracotta text-white shadow-aurora-glow'
                    : 'bg-white text-aurora-navy ring-1 ring-aurora-navy/10 hover:ring-aurora-terracotta/50'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <p className="mb-4 text-sm text-aurora-navy/55" aria-live="polite">
          {filteredFaqs.length} {filteredFaqs.length === 1 ? 'pregunta' : 'preguntas'}
        </p>

        {filteredFaqs.length > 0 ? (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const open = openQuestion === faq.id;
              return (
                <div key={faq.id} className={`overflow-hidden rounded-2xl bg-white ring-1 transition-shadow duration-300 ${open ? 'shadow-aurora ring-aurora-terracotta/30' : 'shadow-aurora-sm ring-aurora-navy/5'}`}>
                  <h2>
                    <button
                      type="button"
                      onClick={() => toggleQuestion(faq.id)}
                      aria-expanded={open}
                      aria-controls={`faq-panel-${faq.id}`}
                      id={`faq-button-${faq.id}`}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    >
                      <span className="font-display text-xl font-medium text-aurora-navy">{faq.question}</span>
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                          open ? 'rotate-180 bg-aurora-terracotta text-white' : 'bg-aurora-cream text-aurora-terracotta'
                        }`}
                        aria-hidden="true"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.6} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </span>
                    </button>
                  </h2>
                  <div
                    id={`faq-panel-${faq.id}`}
                    role="region"
                    aria-labelledby={`faq-button-${faq.id}`}
                    className={`grid transition-all duration-300 ease-in-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 leading-relaxed text-aurora-navy/70">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl bg-white py-14 text-center shadow-aurora-sm ring-1 ring-aurora-navy/5">
            <p className="font-display text-2xl font-medium text-aurora-navy">No encontramos preguntas con esa búsqueda.</p>
            <p className="mt-2 text-sm text-aurora-navy/55">Probá con otras palabras o elegí otra categoría.</p>
          </div>
        )}

        <Reveal className="mt-16">
          <div className="hero-mesh grain relative isolate overflow-hidden rounded-3xl px-6 py-12 text-center text-white shadow-aurora-lg">
            <h2 className="font-display text-3xl font-normal md:text-4xl">¿No encontraste tu respuesta?</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/85">Escribinos y te ayudamos. Respondemos por correo lo antes posible.</p>
            <Link
              to="/contact"
              className="btn-shine mt-7 inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 font-semibold text-aurora-terracottaDark shadow-aurora-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-aurora-cream"
            >
              Contactar a soporte
            </Link>
          </div>
        </Reveal>

        <div className="mt-16">
          <Reveal>
            <h2 className="mb-8 text-center font-display text-3xl font-medium text-aurora-navy">Seguí explorando</h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {explore.map((item, index) => (
              <Reveal key={item.to} delay={index * 90} className="h-full">
                <Link
                  to={item.to}
                  className="group flex h-full flex-col rounded-3xl bg-white p-6 shadow-aurora-sm ring-1 ring-aurora-navy/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-aurora-lg"
                >
                  <h3 className="font-display text-xl font-medium text-aurora-navy">{item.title}</h3>
                  <p className="mt-2 flex-grow text-sm leading-relaxed text-aurora-navy/60">{item.text}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-aurora-terracotta">
                    {item.cta}
                    <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
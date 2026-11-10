import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../api/config';
import { useAuth } from '../../App';
import WelcomeModal from '../../components/common/WelcomeModal';
import ClubTile from '../../components/native/ClubTile';
import Reveal from '../../components/native/Reveal';
import { Club } from '../../types/club';
import { tapFeedback } from '../../utils/native';
import { useSiteContent } from '../../utils/useSiteContent';

const categories = [
  { key: 'gourmet', emoji: '🍫', label: 'Gourmet y bebidas', tone: 'from-aurora-terracotta to-aurora-terracottaLight text-white' },
  { key: 'lectura', emoji: '📚', label: 'Lectura y cultura', tone: 'from-aurora-navy to-aurora-navyLight text-white' },
  { key: 'belleza', emoji: '💅', label: 'Belleza y cuidado', tone: 'from-aurora-gold to-aurora-goldLight text-aurora-navyDark' },
  { key: 'hogar', emoji: '🌿', label: 'Hogar y plantas', tone: 'from-[#3E6B5A] to-[#5E8F7B] text-white' },
];

const steps = [
  { icon: '🔍', title: 'Explorá y descubrí', text: 'Mirá los clubes, compará planes y elegí la experiencia que va con vos.' },
  { icon: '📦', title: 'Suscribite fácil', text: 'Elegí tu plan y pagá de forma segura, todo desde la app.' },
  { icon: '🎁', title: 'Recibí tu sorpresa', text: 'Tu caja llega a tu puerta y podés seguir el envío en todo momento.' },
  { icon: '💬', title: 'Compartí y conectá', text: 'Dejá tu reseña y sumate a una comunidad que ama las sorpresas.' },
];

const testimonials = [
  {
    id: 't1',
    quote: 'Descubrí clubes increíbles que nunca hubiera encontrado. La experiencia es fluida y me encanta el seguimiento de mis cajas.',
    author: 'Lucía R.',
    role: 'Suscriptora, amante de los libros',
  },
  {
    id: 't2',
    quote: 'La mejor forma de manejar mis suscripciones. Todo en un solo lugar, pagos seguros y siempre sé cuándo llega mi caja.',
    author: 'Tomás M.',
    role: 'Suscriptor, fan del café',
  },
  {
    id: 't3',
    quote: 'El packaging es precioso y la caja llegó justo en la fecha que me avisaron. Ya se la recomendé a mis amigas.',
    author: 'Valentina C.',
    role: 'Suscriptora, cajas de belleza',
  },
  {
    id: 't4',
    quote: 'Poder ver todos los clubes y comparar planes en un solo lugar me ahorró muchísimo tiempo.',
    author: 'Joaquín S.',
    role: 'Suscriptor, club gourmet',
  },
];

const helpLinks = [
  { to: '/faq', label: 'Preguntas frecuentes' },
  { to: '/contact', label: 'Contacto' },
  { to: '/about-us', label: 'Sobre AuraBox' },
  { to: '/platform-rules', label: 'Reglas de la plataforma' },
];

const rowClass = '-mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-4 overflow-x-auto px-4 pb-4 no-scrollbar';

const enter = (delay: number): React.CSSProperties => ({ animationDelay: `${delay}ms`, animationFillMode: 'both' });

interface SectionTitleProps {
  eyebrow: string;
  title: string;
  actionTo?: string;
  actionLabel?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ eyebrow, title, actionTo, actionLabel }) => (
  <div className="mb-4 flex items-end justify-between gap-3">
    <div>
      <span className="section-eyebrow !mb-1 !text-xs">{eyebrow}</span>
      <h2 className="font-display text-2xl font-bold leading-tight text-aurora-navy">{title}</h2>
    </div>
    {actionTo && (
      <Link
        to={actionTo}
        onClick={() => {
          tapFeedback();
        }}
        className="shrink-0 pb-1 text-sm font-semibold text-aurora-terracotta"
      >
        {actionLabel}
      </Link>
    )}
  </div>
);

const TileSkeletons: React.FC = () => (
  <div className={rowClass}>
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="h-64 w-[62vw] max-w-[240px] shrink-0 snap-start animate-pulse rounded-3xl bg-white shadow-aurora-sm" />
    ))}
  </div>
);

const NativeHomePage: React.FC = () => {
  const { user, isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const siteContent = useSiteContent();
  const isCustomer = isAuthenticated && userRole === 'customer';

  const [featured, setFeatured] = useState<Club[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [featuredFailed, setFeaturedFailed] = useState(false);
  const [recommended, setRecommended] = useState<Club[]>([]);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState<string | undefined>(undefined);

  const loadFeatured = useCallback(async () => {
    setLoadingFeatured(true);
    setFeaturedFailed(false);
    try {
      const response = await api.get('/clubs/featured');
      const data = getResponseData(response);
      setFeatured(Array.isArray(data) ? data : []);
    } catch {
      setFeaturedFailed(true);
    } finally {
      setLoadingFeatured(false);
    }
  }, []);

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  useEffect(() => {
    if (!isCustomer) {
      setRecommended([]);
      return;
    }
    let active = true;
    const loadRecommended = async () => {
      setLoadingRecommended(true);
      try {
        const response = await api.get('/clubs/recommendations');
        const data = getResponseData(response);
        if (active) setRecommended(Array.isArray(data) ? data : []);
      } catch {
        if (active) setRecommended([]);
      } finally {
        if (active) setLoadingRecommended(false);
      }
    };
    loadRecommended();
    return () => {
      active = false;
    };
  }, [isCustomer]);

  useEffect(() => {
    const state = location.state as { showWelcome?: boolean; welcomeName?: string } | null;
    if (state?.showWelcome) {
      setWelcomeName(state.welcomeName);
      setShowWelcome(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const greeting = user?.firstName ? `Hola, ${user.firstName} 👋` : '¡Hola! Te damos la bienvenida 👋';

  return (
    <div className="bg-aurora-cream">
      {showWelcome && <WelcomeModal name={welcomeName} onClose={() => setShowWelcome(false)} />}

      <section className="relative overflow-hidden rounded-b-[2.25rem] bg-gradient-to-b from-aurora-navy via-aurora-navy to-aurora-navyLight px-5 pb-9 pt-5 text-white">
        {siteContent.hero_image && (
          <img src={siteContent.hero_image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-15" />
        )}
        <div className="pointer-events-none absolute -right-16 -top-10 h-56 w-56 animate-glowPulse rounded-full bg-aurora-gold/25 blur-3xl" />
        <div
          className="pointer-events-none absolute -bottom-10 -left-20 h-48 w-48 animate-glowPulse rounded-full bg-aurora-terracotta/35 blur-3xl"
          style={{ animationDelay: '1.5s' }}
        />

        <div className="relative">
          <p className="animate-fadeInUp text-sm font-semibold text-aurora-goldLight" style={enter(0)}>
            {greeting}
          </p>
          <h1 className="mt-2 animate-fadeInUp font-display text-[2rem] font-bold leading-[1.1]" style={enter(100)}>
            Cada mes, una <span className="text-gradient-aurora">sorpresa</span> en tu puerta
          </h1>
          <p className="mt-3 animate-fadeInUp text-[15px] leading-relaxed text-white/75" style={enter(200)}>
            {siteContent.hero_subtitle || 'Experiencias únicas, curadas con pasión por emprendedores argentinos.'}
          </p>

          <button
            type="button"
            onClick={() => {
              tapFeedback();
              navigate('/explore');
            }}
            className="mt-6 flex h-14 w-full animate-fadeInUp items-center gap-3 rounded-2xl bg-white px-4 text-left text-aurora-navy/55 shadow-aurora transition-transform duration-200 active:scale-[0.98]"
            style={enter(300)}
          >
            <svg className="h-6 w-6 text-aurora-terracotta" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <span className="text-[15px]">Buscá clubes, cajas y categorías</span>
          </button>

          <div className="no-scrollbar -mx-5 mt-5 flex animate-fadeInUp gap-2 overflow-x-auto px-5" style={enter(400)}>
            {['🔒 Pago seguro', '🇦🇷 Emprendedores locales', '📦 Seguí tu caja'].map((chip) => (
              <span key={chip} className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 ring-1 ring-white/15">
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="space-y-12 px-4 py-9">
        <Reveal>
          <SectionTitle eyebrow="Empezá por acá" title="¿Qué te tienta hoy?" />
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <button
                key={category.key}
                type="button"
                onClick={() => {
                  tapFeedback();
                  navigate(`/explore?category=${category.key}`);
                }}
                className={`relative flex h-28 flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br p-4 text-left shadow-aurora-sm transition-transform duration-200 active:scale-[0.96] ${category.tone}`}
              >
                <span className="absolute -right-3 -top-3 text-6xl opacity-25" aria-hidden="true">
                  {category.emoji}
                </span>
                <span className="text-3xl" aria-hidden="true">
                  {category.emoji}
                </span>
                <span className="text-sm font-bold leading-tight">{category.label}</span>
              </button>
            ))}
          </div>
        </Reveal>

        {isCustomer && (loadingRecommended || recommended.length > 0) && (
          <Reveal>
            <SectionTitle eyebrow="Para vos" title="Recomendados" actionTo="/explore" actionLabel="Ver todos" />
            {loadingRecommended ? (
              <TileSkeletons />
            ) : (
              <div className={rowClass}>
                {recommended.map((club) => (
                  <ClubTile
                    key={club.id}
                    id={club.id}
                    name={club.name}
                    slogan={club.slogan}
                    logoUrl={club.logoUrl}
                    averageRating={club.averageRating}
                  />
                ))}
              </div>
            )}
          </Reveal>
        )}

        <Reveal>
          <SectionTitle eyebrow="La comunidad elige" title="Clubes destacados" actionTo="/explore" actionLabel="Ver todos" />
          {loadingFeatured ? (
            <TileSkeletons />
          ) : featuredFailed ? (
            <div role="alert" className="rounded-3xl bg-white p-6 text-center shadow-aurora-sm ring-1 ring-aurora-navy/5">
              <p className="text-sm text-aurora-navy/70">No pudimos cargar los clubes. Revisá tu conexión e intentá de nuevo.</p>
              <button
                type="button"
                onClick={() => {
                  tapFeedback();
                  loadFeatured();
                }}
                className="btn-primary mt-4 !px-6 !py-2.5 !text-sm"
              >
                Reintentar
              </button>
            </div>
          ) : featured.length === 0 ? (
            <div className="rounded-3xl bg-white p-6 text-center text-sm text-aurora-navy/60 shadow-aurora-sm ring-1 ring-aurora-navy/5">
              Todavía no hay clubes destacados.
            </div>
          ) : (
            <div className={rowClass}>
              {featured.map((club) => (
                <ClubTile
                  key={club.id}
                  id={club.id}
                  name={club.name}
                  slogan={club.slogan}
                  logoUrl={club.logoUrl}
                  averageRating={club.averageRating}
                />
              ))}
            </div>
          )}
        </Reveal>

        <section>
          <Reveal>
            <SectionTitle eyebrow="El camino" title="¿Cómo funciona?" />
          </Reveal>
          <div className="relative ml-5 border-l-2 border-dashed border-aurora-terracotta/30 pl-8">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 80} className="relative pb-7 last:pb-0">
                <span className="absolute -left-[3.3rem] flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow-aurora-sm ring-2 ring-aurora-gold/40">
                  {step.icon}
                </span>
                <h3 className="font-display text-lg font-bold text-aurora-navy">
                  <span className="mr-1.5 text-aurora-terracotta">{index + 1}.</span>
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-aurora-navy/65">{step.text}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <Reveal>
          <SectionTitle eyebrow="Opiniones" title="Lo que dicen" />
          <div className={rowClass}>
            {testimonials.map((item) => (
              <figure
                key={item.id}
                className="w-[82vw] max-w-sm shrink-0 snap-center rounded-3xl bg-white p-6 shadow-aurora-sm ring-1 ring-aurora-navy/5"
              >
                <div className="mb-3 text-lg tracking-wider text-aurora-gold" role="img" aria-label="5 estrellas">
                  ★★★★★
                </div>
                <blockquote className="selectable text-[15px] leading-relaxed text-aurora-ink/80">“{item.quote}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-aurora-terracotta to-aurora-gold font-display text-lg font-bold text-white">
                    {item.author.charAt(0)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-aurora-navy">{item.author}</span>
                    <span className="block truncate text-xs text-aurora-navy/55">{item.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-1 text-center text-xs text-aurora-navy/45">Testimonios ilustrativos de ejemplo.</p>
        </Reveal>

        <Reveal>
          <div className="overflow-hidden rounded-3xl bg-white shadow-aurora-sm ring-1 ring-aurora-navy/5">
            {helpLinks.map((link, index) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => {
                  tapFeedback();
                }}
                className={`flex min-h-[52px] items-center justify-between px-5 text-[15px] font-semibold text-aurora-navy transition-colors active:bg-aurora-cream ${
                  index > 0 ? 'border-t border-aurora-navy/5' : ''
                }`}
              >
                {link.label}
                <svg className="h-4 w-4 text-aurora-navy/35" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-aurora-navy/45">AuraBox · Hecho en Argentina con cariño</p>
        </Reveal>
      </div>
    </div>
  );
};

export default NativeHomePage;
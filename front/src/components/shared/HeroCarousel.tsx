import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SafeImage from '../common/SafeImage';

interface FeaturedClubSummary {
  id: string | number;
  name: string;
  slogan?: string;
  logoUrl?: string;
  averageRating?: number | null;
  totalReviews?: number | null;
}

interface HeroCarouselProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  featuredClub?: FeaturedClubSummary | null;
}

const SLIDE_COUNT = 4;
const AUTOPLAY_MS = 7000;

const quickCategories = [
  { key: 'gourmet', label: 'Gourmet' },
  { key: 'lectura', label: 'Lectura' },
  { key: 'belleza', label: 'Belleza' },
  { key: 'hogar', label: 'Hogar' },
];

const stepCards = [
  { icon: '🔍', title: 'Elegí tu club', text: 'Explorá, compará planes y encontrá el que va con vos.' },
  { icon: '🔒', title: 'Pagá seguro', text: 'Con Mercado Pago o tarjeta, sin vueltas.' },
  { icon: '📦', title: 'Recibí y seguí tu caja', text: 'Mirá el estado de cada envío desde tu cuenta.' },
];

const bars = [35, 50, 42, 64, 58, 78, 90];

const pill = 'glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-white md:text-sm';
const primaryBtn =
  'inline-flex items-center justify-center rounded-full bg-aurora-terracotta px-7 py-3.5 text-base font-semibold text-white shadow-aurora-glow transition-all duration-300 hover:-translate-y-0.5 hover:bg-aurora-terracottaDark focus:outline-none focus:ring-4 focus:ring-aurora-sun/50';
const whiteBtn =
  'inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-base font-semibold text-aurora-terracottaDark shadow-aurora transition-all duration-300 hover:-translate-y-0.5 hover:bg-aurora-cream focus:outline-none focus:ring-4 focus:ring-aurora-sun/50';
const ghostBtn =
  'glass inline-flex items-center justify-center rounded-full px-7 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:bg-white/25 focus:outline-none focus:ring-4 focus:ring-white/30';

const Dot: React.FC = () => (
  <span className="relative flex h-2 w-2">
    <span className="absolute inline-flex h-full w-full animate-ringPulse rounded-full bg-aurora-sun" />
    <span className="relative inline-flex h-2 w-2 rounded-full bg-aurora-sun" />
  </span>
);

const HeroCarousel: React.FC<HeroCarouselProps> = ({ title, subtitle, backgroundImage, featuredClub }) => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [query, setQuery] = useState('');
  const touchStart = useRef<number | null>(null);

  const reduceMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const go = useCallback((next: number) => {
    setIndex(((next % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const timer = setTimeout(() => setIndex((current) => (current + 1) % SLIDE_COUNT), AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [index, paused, reduceMotion]);

  const onTouchStart = (event: React.TouchEvent) => {
    touchStart.current = event.touches[0].clientX;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStart.current;
    touchStart.current = null;
    if (Math.abs(delta) > 50) go(delta < 0 ? index + 1 : index - 1);
  };

  const onSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    navigate(value ? `/explore?search=${encodeURIComponent(value)}` : '/explore');
  };

  const slideClass = (i: number) =>
    `[grid-area:1/1] transition-opacity duration-700 ${
      i === index ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0'
    }`;

  const rating = featuredClub?.averageRating ? Number(featuredClub.averageRating).toFixed(1) : null;
  const reviews = featuredClub?.totalReviews ?? 0;

  return (
    <section
      className="relative isolate overflow-hidden bg-aurora-navy text-white"
      aria-roledescription="carrusel"
      aria-label="Novedades de AuraBox"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          aria-hidden="true"
          className={`hero-slide-${i + 1} absolute inset-0 -z-20 transition-opacity duration-1000 ${i === index ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      {backgroundImage && (
        <img
          src={backgroundImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-10 mix-blend-luminosity"
        />
      )}
      <div className="grain absolute inset-0 -z-10" aria-hidden="true" />

      <div className="container relative mx-auto grid px-4 pb-32 pt-28 md:pb-36 md:pt-36">
        <div className={slideClass(0)} aria-hidden={index !== 0}>
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <span className={pill}>
                <Dot />
                Clubes de suscripción en Argentina
              </span>
              <h1 className="font-display text-5xl font-normal leading-[1.02] md:text-6xl lg:text-7xl">
                {title ? (
                  title
                ) : (
                  <>
                    Cajas hechas por emprendedores, <em className="italic text-aurora-goldLight">para vos</em>
                  </>
                )}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
                {subtitle || 'Descubrí clubes curados, compará planes y recibí una sorpresa cada mes, con pago seguro y seguimiento.'}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/explore" className={primaryBtn}>
                  Explorar clubes
                </Link>
                <Link to="/register/entrepreneur" className={ghostBtn}>
                  Soy emprendedor
                </Link>
              </div>
            </div>

            <div className="relative hidden h-[380px] lg:block">
              <div className="absolute left-6 top-6 w-[360px] -rotate-[1.5deg] rounded-3xl bg-white p-6 text-aurora-navy shadow-aurora-lg">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-aurora-cream">
                    <SafeImage
                      src={featuredClub?.logoUrl}
                      alt={featuredClub?.name || 'Club'}
                      className="h-full w-full object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-display text-xl font-medium">{featuredClub?.name || 'Tu próximo club'}</p>
                    <p className="text-sm text-aurora-navy/60">
                      {rating ? `★ ${rating} · ${reviews} ${reviews === 1 ? 'reseña' : 'reseñas'}` : 'Emprendimientos argentinos'}
                    </p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-2 min-h-[2.75rem] text-sm italic text-aurora-navy/60">
                  {featuredClub?.slogan || 'Elegí entre cajas curadas por quienes las hacen.'}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-aurora-navy/80">
                  <li className="flex items-center gap-2">
                    <span className="text-aurora-teal">✓</span> Pago seguro con Mercado Pago
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-aurora-teal">✓</span> Seguimiento de cada envío
                  </li>
                </ul>
                <Link
                  to={featuredClub ? `/club/${featuredClub.id}` : '/explore'}
                  className="mt-5 block rounded-xl bg-aurora-terracotta py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-aurora-terracottaDark"
                >
                  Ver club
                </Link>
              </div>
              <div className="absolute right-0 top-0 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-aurora-navy shadow-aurora-lg">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-aurora-teal text-white">✓</span>
                <span>
                  <b className="block">Pago seguro</b>Tarjetas y Mercado Pago
                </span>
              </div>
              <div className="absolute bottom-2 right-2 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-aurora-navy shadow-aurora-lg">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-aurora-gold text-white">📦</span>
                <span>
                  <b className="block">Seguí tu caja</b>Estado del envío en vivo
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={slideClass(1)} aria-hidden={index !== 1}>
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <span className={pill}>
              <Dot />
              Encontrá tu club
            </span>
            <h2 className="font-display text-5xl font-normal leading-[1.02] md:text-6xl lg:text-7xl">
              Encontrá el club que <em className="italic text-aurora-goldLight">te sorprenda</em> cada mes
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
              Emprendedores argentinos, cajas curadas y una experiencia simple de principio a fin.
            </p>
            <form onSubmit={onSearch} className="mt-9 flex w-full max-w-2xl items-center rounded-full bg-white p-2 pl-6 shadow-aurora-lg">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar clubes, cajas y categorías"
                aria-label="Buscar clubes"
                className="min-w-0 flex-1 bg-transparent text-base text-aurora-navy placeholder:text-aurora-navy/40 focus:outline-none"
              />
              <button type="submit" className="rounded-full bg-aurora-terracotta px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-aurora-terracottaDark">
                Buscar
              </button>
            </form>
            <p className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-white/75">
              Populares:
              {quickCategories.map((category) => (
                <Link
                  key={category.key}
                  to={`/explore?category=${category.key}`}
                  className="border-b border-dashed border-white/50 transition-colors hover:text-white"
                >
                  {category.label}
                </Link>
              ))}
            </p>
          </div>
        </div>

        <div className={slideClass(2)} aria-hidden={index !== 2}>
          <div className="mx-auto max-w-5xl text-center">
            <span className={pill}>
              <Dot />
              Así de simple
            </span>
            <h2 className="mx-auto max-w-3xl font-display text-5xl font-normal leading-[1.02] md:text-6xl">
              De tu pantalla a tu puerta, <em className="italic text-aurora-goldLight">en tres pasos</em>
            </h2>
            <div className="mt-12 grid gap-4 text-left md:grid-cols-3">
              {stepCards.map((step, stepIndex) => (
                <div key={step.title} className="glass rounded-3xl p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl">{step.icon}</span>
                    <span className="font-display text-3xl text-white/40">{stepIndex + 1}</span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-medium">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">{step.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Link to="/explore" className={whiteBtn}>
                Empezar a explorar
              </Link>
            </div>
          </div>
        </div>

        <div className={slideClass(3)} aria-hidden={index !== 3}>
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <span className={pill}>
                <Dot />
                Para emprendedores
              </span>
              <h2 className="font-display text-5xl font-normal leading-[1.02] md:text-6xl lg:text-7xl">
                ¿Tenés un club? <em className="italic text-aurora-goldLight">Hacelo crecer</em> con AuraBox
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
                Centralizá tu gestión, ampliá tu visibilidad y llegá a nuevos suscriptores sin complicaciones.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/register/entrepreneur" className={whiteBtn}>
                  Registrá tu club
                </Link>
                <Link to="/about-us" className={ghostBtn}>
                  Conocé más
                </Link>
              </div>
            </div>

            <div className="relative hidden h-[360px] lg:block">
              <div className="absolute left-6 top-4 w-[380px] rotate-[1.5deg] rounded-3xl bg-white p-6 text-aurora-navy shadow-aurora-lg">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-aurora-navy font-display text-lg text-white">Ab</span>
                  <div>
                    <p className="font-display text-xl font-medium">Tu panel de club</p>
                    <p className="text-xs text-aurora-navy/50">Ejemplo ilustrativo</p>
                  </div>
                </div>
                <div className="mt-5 flex h-28 items-end gap-2">
                  {bars.map((height, barIndex) => (
                    <span
                      key={barIndex}
                      style={{ height: `${height}%` }}
                      className="flex-1 rounded-t-md bg-gradient-to-b from-aurora-gold to-aurora-terracotta"
                    />
                  ))}
                </div>
                <div className="mt-4 flex justify-between rounded-xl border border-aurora-navy/10 px-4 py-3 text-sm">
                  <span>Nuevos suscriptores</span>
                  <span className="text-aurora-teal">▲</span>
                </div>
                <div className="mt-2 flex justify-between rounded-xl border border-aurora-navy/10 px-4 py-3 text-sm">
                  <span>Envíos a preparar</span>
                  <span className="text-aurora-navy/40">•••</span>
                </div>
              </div>
              <div className="absolute bottom-6 right-0 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-aurora-navy shadow-aurora-lg">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-aurora-teal text-white">★</span>
                <span>
                  <b className="block">Reseñas de tu comunidad</b>Todo en un solo lugar
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => go(index - 1)}
        aria-label="Diapositiva anterior"
        className="glass absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-xl text-white transition-colors hover:bg-white/25 md:flex"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        aria-label="Diapositiva siguiente"
        className="glass absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-xl text-white transition-colors hover:bg-white/25 md:flex"
      >
        ›
      </button>

      <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2 md:bottom-24" role="tablist" aria-label="Elegir diapositiva">
        {[0, 1, 2, 3].map((i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Ir a la diapositiva ${i + 1}`}
            onClick={() => go(i)}
            className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>

      <svg
        className="absolute bottom-[-1px] left-0 block h-8 w-full text-aurora-cream md:h-12"
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path fill="currentColor" d="M0,48 C240,96 480,0 720,32 C960,64 1200,96 1440,40 L1440,80 L0,80 Z" />
      </svg>
    </section>
  );
};

export default HeroCarousel;
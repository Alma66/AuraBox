import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import HeroCarousel from '../components/shared/HeroCarousel';
import AlternatingContent from '../components/shared/AlternatingContent';
import TestimonialCard from '../components/shared/TestimonialCard';
import HowItWorks from '../components/shared/HowItWorks';
import FeaturedClubCard from '../components/shared/FeaturedClubCard';
import WelcomeModal from '../components/common/WelcomeModal';
import Reveal from '../components/common/Reveal';
import api, { getResponseData } from '../api/config';
import { Club } from '../types/club';
import { useSiteContent } from '../utils/useSiteContent';

const testimonialsData = [
  {
    id: 't1',
    quote: 'AuraBox transformó mi club. La gestión es sencilla y mis ventas se duplicaron. ¡Mis clientes están felices y yo también!',
    author: 'Sofía G.',
    role: 'Emprendedora, Club de Plantas',
    image: '',
  },
  {
    id: 't2',
    quote: 'Descubrí clubes increíbles que nunca hubiera encontrado. La experiencia es fluida y me encanta el seguimiento de mis cajas.',
    author: 'Lucía R.',
    role: 'Suscriptora, Amante de los Libros',
    image: '',
  },
  {
    id: 't3',
    quote: 'La mejor plataforma para gestionar mis suscripciones. Todo en un solo lugar, pagos seguros y siempre sé cuándo llega mi caja.',
    author: 'Tomás M.',
    role: 'Suscriptor, Fan del Café',
    image: '',
  },
  {
    id: 't4',
    quote: 'Mi club de vinos creció exponencialmente gracias a la visibilidad y las herramientas de AuraBox. ¡Un antes y un después!',
    author: 'Martín P.',
    role: 'Emprendedor, Club de Vinos',
    image: '',
  },
];

const categoryCards = [
  { key: 'gourmet', emoji: '🍫', label: 'Gourmet y bebidas', hint: 'Sabores para disfrutar', tone: 'from-aurora-terracotta to-aurora-coral', text: 'text-white' },
  { key: 'lectura', emoji: '📚', label: 'Lectura y cultura', hint: 'Historias en tu buzón', tone: 'from-aurora-navy to-aurora-navyLight', text: 'text-white' },
  { key: 'belleza', emoji: '💅', label: 'Belleza y cuidado', hint: 'Un momento para vos', tone: 'from-aurora-berry to-aurora-coral', text: 'text-white' },
  { key: 'hogar', emoji: '🌿', label: 'Hogar y plantas', hint: 'Tu espacio, más lindo', tone: 'from-aurora-teal to-aurora-navyLight', text: 'text-white' },
];

const trustItems = [
  { title: 'Pago seguro', text: 'Tarjetas y Mercado Pago' },
  { title: 'Seguimiento', text: 'Estado de cada envío' },
  { title: 'Emprendedores locales', text: 'Hecho en Argentina' },
  { title: 'Sin permanencia', text: 'Cancelás cuando quieras' },
];

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ eyebrow, title, subtitle }) => (
  <div className="mx-auto mb-12 max-w-2xl text-center">
    <span className="section-eyebrow">{eyebrow}</span>
    <h2 className="font-display text-4xl font-medium text-aurora-navy md:text-5xl">{title}</h2>
    {subtitle && <p className="mt-4 text-lg text-aurora-navy/60">{subtitle}</p>}
  </div>
);

const CardSkeletons: React.FC = () => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-72 animate-pulse rounded-3xl bg-white shadow-aurora-sm" />
    ))}
  </div>
);

const HomePage: React.FC = () => {
  const [featuredClubs, setFeaturedClubs] = useState<Club[]>([]);
  const [recommendedClubs, setRecommendedClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState<string | undefined>(undefined);
  const location = useLocation();
  const navigate = useNavigate();
  const siteContent = useSiteContent();
  const isLoggedIn = !!localStorage.getItem('access_token');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get('/clubs/featured');
        const data = getResponseData(response);
        setFeaturedClubs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching featured clubs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchRecommended = async () => {
      setLoadingRecommended(true);
      try {
        const response = await api.get('/clubs/recommendations');
        const data = getResponseData(response);
        setRecommendedClubs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching recommended clubs:', error);
      } finally {
        setLoadingRecommended(false);
      }
    };
    fetchRecommended();
  }, [isLoggedIn]);

  useEffect(() => {
    const state = location.state as { showWelcome?: boolean; welcomeName?: string } | null;
    if (state?.showWelcome) {
      setWelcomeName(state.welcomeName);
      setShowWelcome(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const testimonialCarouselSettings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-aurora-cream">
      {showWelcome && <WelcomeModal name={welcomeName} onClose={() => setShowWelcome(false)} />}

      <HeroCarousel
        title={siteContent.hero_title || undefined}
        subtitle={siteContent.hero_subtitle || undefined}
        backgroundImage={siteContent.hero_image}
        featuredClub={featuredClubs[0] ?? null}
      />

      <div className="container relative z-10 mx-auto -mt-8 px-4">
        <div className="grid divide-aurora-navy/10 rounded-3xl bg-white shadow-aurora-lg ring-1 ring-aurora-navy/5 sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item.title} className="border-b border-aurora-navy/10 px-6 py-5 last:border-b-0 sm:border-b-0">
              <b className="block text-base font-semibold text-aurora-navy">{item.title}</b>
              <span className="text-sm text-aurora-navy/60">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="container mx-auto px-4 pt-20">
        <Reveal>
          <SectionHeading
            eyebrow="Empezá por acá"
            title="¿Qué tipo de sorpresa te tienta hoy?"
            subtitle="Elegí una categoría y te mostramos los clubes que van con vos."
          />
        </Reveal>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {categoryCards.map((card, index) => (
            <Reveal key={card.key} delay={index * 90}>
              <button
                type="button"
                onClick={() => navigate(`/explore?category=${card.key}`)}
                className={`group relative flex h-44 w-full flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-left shadow-aurora-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-aurora-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-aurora-gold/60 md:h-52 ${card.tone} ${card.text}`}
              >
                <span
                  className="absolute -right-4 -top-4 text-8xl opacity-20 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-125"
                  aria-hidden="true"
                >
                  {card.emoji}
                </span>
                <span className="text-4xl transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
                  {card.emoji}
                </span>
                <span>
                  <span className="block font-display text-xl font-medium leading-tight md:text-2xl">{card.label}</span>
                  <span className="mt-1 block text-xs font-medium text-white/80 md:text-sm">{card.hint}</span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="container mx-auto flex-grow px-4 py-20">
        {isLoggedIn && (recommendedClubs.length > 0 || loadingRecommended) && (
          <section className="mb-24">
            <Reveal>
              <SectionHeading
                eyebrow="Para vos"
                title="Recomendado para vos"
                subtitle="Según tus suscripciones y tus preferencias de contenido."
              />
            </Reveal>
            {loadingRecommended ? (
              <CardSkeletons />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {recommendedClubs.map((club, index) => (
                  <Reveal key={club.id} delay={index * 80} className="h-full">
                    <FeaturedClubCard
                      id={club.id}
                      name={club.name}
                      slogan={club.slogan}
                      logoUrl={club.logoUrl}
                      averageRating={club.averageRating}
                      totalReviews={club.totalReviews}
                    />
                  </Reveal>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="mb-24">
          <Reveal>
            <SectionHeading
              eyebrow="La comunidad elige"
              title="Clubes destacados"
              subtitle="Los clubes mejor calificados por nuestra comunidad."
            />
          </Reveal>

          {loading ? (
            <CardSkeletons />
          ) : featuredClubs.length === 0 ? (
            <div className="py-8 text-center text-aurora-navy/50">No hay clubes destacados disponibles aún.</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {featuredClubs.map((club, index) => (
                <Reveal key={club.id} delay={index * 80} className="h-full">
                  <FeaturedClubCard
                    id={club.id}
                    name={club.name}
                    slogan={club.slogan}
                    logoUrl={club.logoUrl}
                    averageRating={club.averageRating}
                    totalReviews={club.totalReviews}
                  />
                </Reveal>
              ))}
            </div>
          )}

          <Reveal className="mt-12 text-center">
            <Link to="/explore" className="btn-secondary !px-8 !py-3.5">
              Ver todos los clubes
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </Reveal>
        </section>

        <section className="mb-24">
          <HowItWorks />
        </section>

        <section className="mb-24">
          <Reveal>
            <AlternatingContent
              title="Experiencias curadas, directo a tu puerta"
              description="Olvidate de la búsqueda. Nuestros clubes seleccionan lo mejor para vos, desde libros fascinantes hasta delicias gourmet, entregados con la comodidad que merecés. Cada caja es una sorpresa cuidadosamente preparada para deleitar tus sentidos."
              imageUrl={siteContent.home_image_1}
              imageAlt="Caja sorpresa de AuraBox"
              reverse={false}
            />
          </Reveal>
          <Reveal>
            <AlternatingContent
              title="Apoyá emprendedores locales con pasión"
              description="Cada suscripción en AuraBox impulsa a pequeños y medianos emprendedores argentinos, quienes ponen su corazón en cada caja. Descubrí sus historias, sus valores y sé parte de su crecimiento, fomentando la economía local."
              imageUrl={siteContent.home_image_2}
              imageAlt="Emprendedora preparando cajas"
              reverse={true}
            />
          </Reveal>
        </section>

        <section className="mb-24 overflow-hidden rounded-3xl bg-white px-2 py-16 shadow-aurora-sm ring-1 ring-aurora-navy/5 md:px-6">
          <Reveal>
            <SectionHeading eyebrow="Opiniones" title="Lo que dicen nuestros usuarios" />
            <p className="-mt-8 mb-10 text-center text-xs text-aurora-navy/45">Testimonios ilustrativos de ejemplo.</p>
          </Reveal>
          <Slider {...testimonialCarouselSettings}>
            {testimonialsData.map((testimonial) => (
              <div key={testimonial.id} className="px-4">
                <TestimonialCard
                  quote={testimonial.quote}
                  author={testimonial.author}
                  role={testimonial.role}
                  image={testimonial.image}
                />
              </div>
            ))}
          </Slider>
        </section>

        <Reveal>
          <section className="hero-mesh grain relative isolate overflow-hidden rounded-3xl px-6 py-20 text-center text-white shadow-aurora-lg">
            <div className="pointer-events-none absolute -right-16 -top-16 -z-10 h-72 w-72 animate-blobMove rounded-full bg-aurora-sun/30 blur-3xl" />
            <div
              className="pointer-events-none absolute -bottom-20 -left-16 -z-10 h-72 w-72 animate-blobMove rounded-full bg-aurora-coral/40 blur-3xl"
              style={{ animationDelay: '-9s' }}
            />
            <span className="glass mb-5 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
              Para emprendedores
            </span>
            <h2 className="mx-auto max-w-3xl font-display text-4xl font-normal leading-tight md:text-5xl">
              ¿Tenés un club? <em className="italic text-aurora-goldLight">Hacelo crecer</em> con AuraBox
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/85">
              Centralizá tu gestión, ampliá tu visibilidad y conectá con una comunidad apasionada. Te damos las herramientas para escalar tu negocio sin complicaciones.
            </p>
            <Link
              to="/register/entrepreneur"
              className="btn-shine mt-9 inline-flex items-center gap-2 rounded-full bg-white px-10 py-4 text-lg font-semibold text-aurora-terracottaDark shadow-aurora-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-aurora-cream focus:outline-none focus:ring-4 focus:ring-aurora-sun/60"
            >
              Registrá tu club
            </Link>
          </section>
        </Reveal>
      </div>
    </div>
  );
};

export default HomePage;
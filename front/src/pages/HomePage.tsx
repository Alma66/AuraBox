import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HeroBanner from '../components/shared/HeroBanner';
import AlternatingContent from '../components/shared/AlternatingContent';
import TestimonialCard from '../components/shared/TestimonialCard';
import HowItWorks from '../components/shared/HowItWorks';
import WelcomeModal from '../components/common/WelcomeModal';
import api, { getResponseData } from '../api/config';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Club } from '../types/club';

const testimonialsData = [
  {
    id: 't1',
    quote: "AuraBox transformó mi club. La gestión es sencilla y mis ventas se duplicaron. ¡Mis clientes están felices y yo también!",
    author: "Sofía G.",
    role: "Emprendedora, Club de Plantas",
    image: "/assets/testimonial-sofia.jpg"
  },
  {
    id: 't2',
    quote: "Descubrí clubes increíbles que nunca hubiera encontrado. La experiencia es fluida y me encanta el seguimiento de mis cajas.",
    author: "Lucía R.",
    role: "Suscriptora, Amante de los Libros",
    image: "/assets/testimonial-lucia.jpg"
  },
  {
    id: 't3',
    quote: "La mejor plataforma para gestionar mis suscripciones. Todo en un solo lugar, pagos seguros y siempre sé cuándo llega mi caja.",
    author: "Tomás M.",
    role: "Suscriptor, Fan del Café",
    image: "/assets/testimonial-tomas.jpg"
  },
  {
    id: 't4',
    quote: "Mi club de vinos creció exponencialmente gracias a la visibilidad y las herramientas de AuraBox. ¡Un antes y un después!",
    author: "Martín P.",
    role: "Emprendedor, Club de Vinos",
    image: "/assets/testimonial-martin.jpg"
  },
];

interface FeaturedClubCardProps {
  id: string | number;
  name: string;
  slogan?: string;
  logoUrl?: string;
  averageRating?: number | null;
}

const FeaturedClubCard: React.FC<FeaturedClubCardProps> = ({ id, name, slogan, logoUrl, averageRating }) => {
  const rating = averageRating ? Number(averageRating).toFixed(1) : '—';

  return (
    <Link
      to={`/club/${id}`}
      className="group block bg-white rounded-2xl shadow-aurora-sm hover:shadow-aurora border border-aurora-navy/5
                 transition-all duration-300 hover:-translate-y-2 p-6 text-center h-full"
    >
      <div className="flex justify-center mb-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-aurora-gold/30
                        group-hover:border-aurora-gold transition-colors duration-300 shadow-sm">
          <img
            src={logoUrl || '/assets/default-club.jpg'}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <h3 className="font-display text-xl font-bold text-aurora-navy mb-1 truncate">{name}</h3>

      <p className="text-aurora-navy/50 text-sm mb-4 italic min-h-[2.5rem] line-clamp-2">
        {slogan ? `"${slogan}"` : ''}
      </p>

      <div className="badge-gold">
        <span>⭐</span>
        <span>{rating}</span>
      </div>
    </Link>
  );
};

const HomePage: React.FC = () => {
  const [featuredClubs, setFeaturedClubs] = useState<Club[]>([]);
  const [recommendedClubs, setRecommendedClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState<string | undefined>(undefined);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('access_token');

  const quizOptions = [
    { key: 'gourmet', label: '🍫 Gourmet & Bebidas', category: 'gourmet' },
    { key: 'lectura', label: '📚 Lectura & Cultura', category: 'lectura' },
    { key: 'belleza', label: '💅 Belleza & Cuidado', category: 'belleza' },
    { key: 'hogar', label: '🌿 Hogar & Plantas', category: 'hogar' },
  ];

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get('/clubs/featured');
        const data = getResponseData(response);
        setFeaturedClubs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching featured clubs:", error);
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
        console.error("Error fetching recommended clubs:", error);
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

  const handleQuizSelect = (key: string, category: string) => {
    setQuizAnswer(key);
    navigate(`/explore?category=${category}`);
  };

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
      { breakpoint: 768, settings: { slidesToShow: 1 } }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-aurora-cream">
      {showWelcome && (
        <WelcomeModal name={welcomeName} onClose={() => setShowWelcome(false)} />
      )}
      <HeroBanner
        title="Descubrí la Magia de los Clubes de Suscripción en Argentina"
        subtitle="Experiencias únicas, curadas con pasión, entregadas en tu puerta."
        ctaText="Explorar Clubes Ahora"
        ctaLink="/explore"
        backgroundImage="/assets/hero-background.jpg"
      />

      <section className="bg-white border-b border-aurora-navy/5">
        <div className="container mx-auto px-4 py-10">
          <div className="text-center mb-6">
            <span className="section-eyebrow">Empezá por acá</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-aurora-navy">¿Qué tipo de sorpresa te tienta hoy?</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {quizOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => handleQuizSelect(opt.key, opt.category)}
                className={`p-5 rounded-2xl border-2 text-center font-semibold transition-all duration-200 hover:-translate-y-1 hover:shadow-aurora-sm ${
                  quizAnswer === opt.key ? 'border-aurora-terracotta bg-aurora-terracotta/5' : 'border-aurora-navy/10 bg-aurora-cream'
                }`}
              >
                <span className="block text-2xl mb-2">{opt.label.split(' ')[0]}</span>
                <span className="text-sm text-aurora-navy">{opt.label.substring(opt.label.indexOf(' ') + 1)}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-14 flex-grow">
        {isLoggedIn && (recommendedClubs.length > 0 || loadingRecommended) && (
          <section className="mb-20">
            <span className="section-eyebrow block text-center">Para vos</span>
            <h2 className="font-display text-4xl font-bold text-aurora-navy mb-2 text-center animate-fadeInUp">
              Recomendado para vos
            </h2>
            <p className="text-center text-aurora-navy/50 mb-10">
              Según tus suscripciones y tus preferencias de contenido
            </p>
            {loadingRecommended ? (
              <div className="text-center py-8 text-aurora-navy/50">Buscando recomendaciones...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {recommendedClubs.map((club) => (
                  <FeaturedClubCard
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
          </section>
        )}

        <section className="mb-20">
          <span className="section-eyebrow block text-center">La comunidad elige</span>
          <h2 className="font-display text-4xl font-bold text-aurora-navy mb-2 text-center animate-fadeInUp">
            Clubes Destacados
          </h2>
          <p className="text-center text-aurora-navy/50 mb-10">
            Los clubes mejor calificados por nuestra comunidad
          </p>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-56 bg-white rounded-2xl shadow-aurora-sm animate-pulse" />
              ))}
            </div>
          ) : featuredClubs.length === 0 ? (
            <div className="text-center py-8 text-aurora-navy/50">
              No hay clubes destacados disponibles aún.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {featuredClubs.map((club) => (
                <FeaturedClubCard
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
        </section>

        <section className="mb-20">
          <AlternatingContent
            title="Experiencias Curadas, Directo a Tu Puerta"
            description="Olvidate de la búsqueda. Nuestros clubes seleccionan lo mejor para vos, desde libros fascinantes hasta delicias gourmet, entregados con la comodidad que merecés. Cada caja es una sorpresa cuidadosamente preparada para deleitar tus sentidos."
            imageUrl="/assets/content-image-1.jpg"
            imageAlt="Caja sorpresa de AuraBox"
            reverse={false}
          />
          <AlternatingContent
            title="Apoyá Emprendedores Locales con Pasión"
            description="Cada suscripción en AuraBox impulsa a pequeños y medianos emprendedores argentinos, quienes ponen su corazón en cada caja. Descubrí sus historias, sus valores y sé parte de su crecimiento, fomentando la economía local."
            imageUrl="/assets/content-image-2.jpg"
            imageAlt="Emprendedora preparando cajas"
            reverse={true}
          />
        </section>

        <section className="mb-20">
          <HowItWorks />
        </section>

        <section className="mb-20 bg-white py-16 rounded-2xl shadow-aurora-sm border border-aurora-navy/5">
          <span className="section-eyebrow block text-center">Voces reales</span>
          <h2 className="font-display text-4xl font-bold text-aurora-navy mb-12 text-center animate-fadeInUp">Lo que dicen nuestros usuarios</h2>
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

        <section className="text-center py-16 px-6 bg-gradient-to-br from-aurora-navy to-aurora-navyDark text-white rounded-2xl shadow-aurora transform transition-all duration-500 hover:scale-[1.005] relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-aurora-gold/10 rounded-full blur-3xl animate-glowPulse" />
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">¿Sos un emprendedor?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-white/75">
            Profesionalizá tu club de suscripción con AuraBox. Centralizá tu gestión, ampliá tu visibilidad y conectá con una comunidad apasionada.
            Te brindamos las herramientas para escalar tu negocio sin complicaciones.
          </p>
          <Link to="/register" className="btn-primary !px-10 !py-4 !text-xl">
            Registrá tu Club Ahora
          </Link>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
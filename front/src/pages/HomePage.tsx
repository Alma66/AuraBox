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
      className="group block bg-white rounded-2xl shadow-md hover:shadow-2xl border border-gray-100
                 transition-all duration-300 hover:-translate-y-2 p-6 text-center h-full"
    >
      <div className="flex justify-center mb-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-100
                        group-hover:border-purple-300 transition-colors duration-300 shadow-sm">
          <img
            src={logoUrl || '/assets/default-club.jpg'}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{name}</h3>

      <p className="text-gray-500 text-sm mb-4 italic min-h-[2.5rem] line-clamp-2">
        {slogan ? `"${slogan}"` : ''}
      </p>

      <div className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-600 font-semibold
                      px-3 py-1 rounded-full text-sm">
        <span>⭐</span>
        <span>{rating}</span>
      </div>
    </Link>
  );
};

const HomePage: React.FC = () => {
  const [featuredClubs, setFeaturedClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState<string | undefined>(undefined);
  const location = useLocation();
  const navigate = useNavigate();

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
      { breakpoint: 768, settings: { slidesToShow: 1 } }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      {showWelcome && (
        <WelcomeModal name={welcomeName} onClose={() => setShowWelcome(false)} />
      )}
      <HeroBanner
        title="Descubre la Magia de los Clubes de Suscripción en Argentina"
        subtitle="Experiencias únicas, curadas con pasión, entregadas en tu puerta."
        ctaText="Explorar Clubes Ahora"
        ctaLink="/explore"
        backgroundImage="/assets/hero-background.jpg"
      />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-2 text-center animate-fadeInUp">
            Clubes Destacados
          </h2>
          <p className="text-center text-gray-500 mb-10">
            Los clubes mejor calificados por nuestra comunidad
          </p>

          {loading ? (
            <div className="text-center py-8">Cargando clubes...</div>
          ) : featuredClubs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
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

        <section className="mb-16">
          <AlternatingContent
            title="Experiencias Curadas, Directo a Tu Puerta"
            description="Olvídate de la búsqueda. Nuestros clubes seleccionan lo mejor para ti, desde libros fascinantes hasta delicias gourmet, entregados con la comodidad que mereces. Cada caja es una sorpresa cuidadosamente preparada para deleitar tus sentidos."
            imageUrl="/assets/content-image-1.jpg"
            imageAlt="Caja sorpresa de AuraBox"
            reverse={false}
          />
          <AlternatingContent
            title="Apoya Emprendedores Locales con Pasión"
            description="Cada suscripción en AuraBox impulsa a pequeños y medianos emprendedores argentinos, quienes ponen su corazón en cada caja. Descubre sus historias, sus valores y sé parte de su crecimiento, fomentando la economía local."
            imageUrl="/assets/content-image-2.jpg"
            imageAlt="Emprendedora preparando cajas"
            reverse={true}
          />
        </section>

        <section className="mb-16">
          <HowItWorks />
        </section>

        <section className="mb-16 bg-gradient-to-r from-blue-50 to-purple-50 py-16 rounded-xl shadow-inner">
          <h2 className="text-4xl font-bold text-gray-800 mb-12 text-center animate-fadeInUp">Lo que dicen nuestros usuarios</h2>
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

        <section className="text-center py-16 bg-blue-600 text-white rounded-lg shadow-xl transform transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl">
          <h2 className="text-4xl font-bold mb-4 animate-pulse-subtle">¿Eres un emprendedor?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-0 animate-fadeInUp delay-200">
            Profesionaliza tu club de suscripción con AuraBox. Centraliza tu gestión, amplía tu visibilidad y conecta con una comunidad apasionada.
            Te brindamos las herramientas para escalar tu negocio sin complicaciones.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-blue-600 px-10 py-4 rounded-full font-bold text-xl
                       hover:bg-blue-100 hover:scale-105 transition-all duration-300 shadow-lg
                       focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-70 animate-bounce-once"
          >
            Registra tu Club Ahora
          </Link>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
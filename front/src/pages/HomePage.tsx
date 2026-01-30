import React from 'react';
import ClubCard from '../components/club/ClubCard';
import HeroBanner from '../components/shared/HeroBanner';
import AlternatingContent from '../components/shared/AlternatingContent';
import TestimonialCard from '../components/shared/TestimonialCard';
import HowItWorks from '../components/shared/HowItWorks';
import clubsData from '../data/clubs.json';
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

const HomePage: React.FC = () => {
  const typedClubsData: Club[] = clubsData as Club[];

  const allClubsForCarousel = typedClubsData.length < 4
    ? [...typedClubsData, ...typedClubsData, ...typedClubsData]
    : typedClubsData;

  const clubCarouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } }
    ]
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
    <div className="min-h-screen flex flex-col">
      <HeroBanner
        title="Descubre la Magia de los Clubes de Suscripción en Argentina"
        subtitle="Experiencias únicas, curadas con pasión, entregadas en tu puerta."
        ctaText="Explorar Clubes Ahora"
        ctaLink="/clubes"
        backgroundImage="/assets/hero-background.jpg"
      />

      <div className="container mx-auto px-4 py-8 flex-grow">
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-10 text-center animate-fadeInUp">Clubes Destacados</h2>
          <Slider {...clubCarouselSettings}>
            {allClubsForCarousel.map((club, index) => (
              <div key={`${club.id}-${index}`} className="px-2">
                <ClubCard
                  id={club.id}
                  name={club.name}
                  category={club.category}
                  description={club.shortDescription}
                  image={club.mainImage || club.logoImage || '/assets/default-club.jpg'}
                  rating={club.rating}
                  reviewsCount={club.reviewsCount}
                  price={club.subscriptionPlans && club.subscriptionPlans.length > 0 ? club.subscriptionPlans[0].price : undefined}
                  currency={club.subscriptionPlans && club.subscriptionPlans.length > 0 ? club.subscriptionPlans[0].currency : undefined}
                />
              </div>
            ))}
          </Slider>
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
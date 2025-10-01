// src/pages/club/ClubDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Slider from 'react-slick';

import clubsData from '../../../data/clubs.json';
import { UserRole, User } from '../../../types/user';
import { Club, LegalSection, SubscriptionPlan } from '../../../types/club';
import { SubscriptionPlan as SubscriptionPlanCardType } from '../../../components/club/SubscriptionPlanCard';

import SubscriptionPlanCard from '../../../components/club/SubscriptionPlanCard';
import ClubSocialMedia from '../../../components/club/ClubSocialMedia';
import ClubLegalInfo from '../../../components/club/ClubLegalInfo';
import ClubPaymentShippingInfo from '../../../components/club/ClubPaymentShippingInfo';
import ClubFeaturedReviews from '../../../components/club/ClubFeaturedReviews';
import { useAuth } from '../../../App';

const bannerSliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 4000,
  arrows: false,
  fade: true,
  cssEase: 'linear',
};

const ClubDetailPage: React.FC<{ userRole: UserRole | null }> = ({ userRole }) => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableClub, setEditableClub] = useState<Club | null>(null);

  useEffect(() => {
    const foundClub = clubsData.find(c => c.id === clubId) as Club | undefined;
    setClub(foundClub || null);
    setEditableClub(foundClub || null);
  }, [clubId]);

  const isOwner = userRole === 'entrepreneur' && user?.managedClubId === clubId;

  if (!club) {
    return (
      <div className="container mx-auto px-4 py-8 text-center animate-fadeIn">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Club no encontrado</h1>
        <p className="text-lg text-gray-700 mb-8">Parece que el club que buscas no existe o fue eliminado.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const handleEditToggle = () => {
    if (isOwner) {
      setIsEditing(!isEditing);
      setEditableClub(club);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (editableClub) {
      setEditableClub({ ...editableClub, [field]: value });
    }
  };

  const handleLegalInfoChange = (field: keyof Club['legalInfo'], value: LegalSection[]) => {
    if (editableClub) {
      setEditableClub({
        ...editableClub,
        legalInfo: {
          ...editableClub.legalInfo,
          [field]: value,
        },
      });
    }
  };

  const handleSave = () => {
    if (editableClub) {
      setClub(editableClub);
    }
    setIsEditing(false);
  };

  // Función para convertir array de secciones a texto plano para textarea
  const sectionsToText = (sections?: LegalSection[]) =>
    sections
      ? sections
          .map(s => (typeof s.content === 'string' ? s.content : s.content.join('\n')))
          .join('\n\n')
      : '';

  // Función para convertir texto plano a array de párrafos (secciones)
  const textToSections = (text: string, prefix: string): LegalSection[] =>
    text.split('\n\n').map((p, i) => ({
      id: `${prefix}-${i}`,
      type: 'paragraph',
      content: p,
    }));

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Banner y encabezado */}
      <div className="relative h-64 md:h-96 overflow-hidden shadow-lg animate-fadeIn">
        {club.bannerImages && club.bannerImages.length > 0 ? (
          <Slider {...bannerSliderSettings}>
            {club.bannerImages.map((imgSrc, index) => (
              <div key={index}>
                <img
                  src={imgSrc}
                  alt={`${club.name} Banner ${index + 1}`}
                  className="w-full h-64 md:h-96 object-cover object-center"
                />
              </div>
            ))}
          </Slider>
        ) : (
          <img
            src={club.mainImage || '/assets/default-banner.jpg'}
            alt={`${club.name} Banner`}
            className="w-full h-64 md:h-96 object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 text-white flex items-end w-full">
          {club.logoImage && (
            <img
              src={club.logoImage}
              alt={`${club.name} Logo`}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg mr-4 object-cover animate-bounce-once"
            />
          )}
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg animate-slideInUp">
              {isEditing && isOwner ? (
                <input
                  type="text"
                  value={editableClub?.name || ''}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className="text-4xl md:text-6xl font-extrabold w-full bg-transparent border-b border-white text-white"
                />
              ) : (
                club.name
              )}
            </h1>
            {club.slogan && (
              <p className="text-lg md:text-xl mt-2 drop-shadow-md animate-fadeIn delay-200">
                {isEditing && isOwner ? (
                  <input
                    type="text"
                    value={editableClub?.slogan || ''}
                    onChange={e => handleInputChange('slogan', e.target.value)}
                    className="w-full bg-transparent border-b border-white text-white"
                  />
                ) : (
                  club.slogan
                )}
              </p>
            )}
          </div>
          {isOwner && (
            <button
              onClick={handleEditToggle}
              className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {isEditing ? 'Cancelar' : 'Editar'}
            </button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 transform hover:translate-x-1"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Volver
        </button>

        {/* Sobre Nosotros */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 animate-fadeInUp">
          <div className="flex justify-between items-center mb-6">
            <span className="inline-block bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full animate-pulse-subtle">
              {club.category}
            </span>
            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-red-100 hover:text-red-600 transition-all duration-200 transform hover:scale-105 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4.5 4.5 0 015.656 0L10 6.343l1.172-1.171a4.5 4.5 0 115.656 5.656L10 17.657l-6.828-6.829a4.5 4.5 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Favorito</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Sobre Nosotros</h2>
              {isEditing && isOwner ? (
                <textarea
                  value={editableClub?.shortDescription || ''}
                  onChange={e => handleInputChange('shortDescription', e.target.value)}
                  className="border rounded w-full p-2 h-32"
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{club.shortDescription}</p>
              )}
            </div>
            {club.fullHistory && (
              <div className="relative group cursor-pointer">
                <img
                  src={club.historyBanner}
                  alt="Nuestra Historia"
                  className="w-full h-48 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link
                    to={`/club/${club.id}/history`}
                    className="text-white text-lg font-semibold px-6 py-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors duration-200 transform hover:scale-110 active:scale-95"
                  >
                    Conocer Nuestra Historia
                  </Link>
                </div>
              </div>
            )}
          </div>

          {club.socialMedia && <ClubSocialMedia socialMedia={club.socialMedia} />}
        </div>

        {/* Planes de Suscripción */}
        {club.subscriptionPlans && club.subscriptionPlans.length > 0 && (
  <div className="mb-12 animate-fadeInUp delay-200">
    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Nuestros Planes de Suscripción</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {club.subscriptionPlans.map(plan => {
        // Mapea plan para cumplir con el tipo esperado por SubscriptionPlanCard
        const planForCard: SubscriptionPlanCardType = {
          planId: plan.planId,
          name: plan.name,
          price: plan.price,
          currency: plan.currency,
          description: plan.description,
          image: plan.image || '/assets/default-plan.jpg', // image obligatorio
          deliveryFrequency: plan.deliveryFrequency || '',
          includes: plan.includes || [],
          shippingAreas: plan.shippingAreas || '',
          specifications: plan.specifications || [],
        };
        return (
          <SubscriptionPlanCard
            key={plan.planId}
            plan={planForCard}
            clubName={club.name}
            detailsLink={`/club/${club.id}/plan/${plan.planId}`}
          />
        );
      })}
    </div>
  </div>
        )}
        {/* Métodos de pago y envío */}
        {(club.paymentMethods || club.shippingInfo) && (
          <div className="mb-12 animate-fadeInUp delay-300">
            <ClubPaymentShippingInfo paymentMethods={club.paymentMethods} shippingInfo={club.shippingInfo} />
          </div>
        )}

        {/* Reseñas destacadas */}
        {club.featuredReviews && club.featuredReviews.length > 0 && (
          <div className="mb-12 animate-fadeInUp delay-400">
            <ClubFeaturedReviews reviews={club.featuredReviews} clubName={club.name} clubId={club.id} />
          </div>
        )}

        {/* Edición de contenido legal para emprendedores */}
        {isEditing && isOwner && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 animate-fadeInUp">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Editar Términos y Condiciones</h2>
            <textarea
              value={sectionsToText(editableClub?.legalInfo?.termsAndConditionsSections)}
              onChange={e => handleLegalInfoChange('termsAndConditionsSections', textToSections(e.target.value, 'tc-edited'))}
              className="border rounded w-full p-2 h-64 mb-4"
              placeholder="Contenido de Términos y Condiciones (texto plano)"
            />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Editar Políticas de Seguridad y Devolución</h2>
            <textarea
              value={sectionsToText(editableClub?.legalInfo?.privacyAndSecurityPolicySections)}
              onChange={e => handleLegalInfoChange('privacyAndSecurityPolicySections', textToSections(e.target.value, 'ps-edited'))}
              className="border rounded w-full p-2 h-64"
              placeholder="Contenido de Políticas de Seguridad y Devolución (texto plano)"
            />
          </div>
        )}

        {/* Enlaces legales visibles para todos */}
        {(club.legalInfo?.termsAndConditionsSections?.length || club.legalInfo?.privacyAndSecurityPolicySections?.length) && (
          <div className="animate-fadeInUp delay-500">
            <ClubLegalInfo legalInfo={club.legalInfo} clubId={club.id} />
          </div>
        )}

        {/* Botones guardar/cancelar */}
        {isEditing && isOwner && (
          <div className="flex space-x-4 mt-6">
            <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Guardar Cambios
            </button>
            <button onClick={handleEditToggle} className="bg-gray-400 text-black px-4 py-2 rounded hover:bg-gray-500">
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubDetailPage;
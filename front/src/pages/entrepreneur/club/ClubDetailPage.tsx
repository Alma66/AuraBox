import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Slider from 'react-slick';
import api, { getResponseData } from '../../../api/config';
import { UserRole } from '../../../types/user';
import { Club, LegalSection } from '../../../types/club';
import { SubscriptionPlan as SubscriptionPlanCardType } from '../../../components/club/SubscriptionPlanCard';
import SubscriptionPlanCard from '../../../components/club/SubscriptionPlanCard';
import ClubSocialMedia from '../../../components/club/ClubSocialMedia';
import ClubLegalInfo from '../../../components/club/ClubLegalInfo';
import ClubPaymentShippingInfo from '../../../components/club/ClubPaymentShippingInfo';
import ClubFeaturedReviews from '../../../components/club/ClubFeaturedReviews';

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

interface ClubWithOwner extends Club {
  isOwner?: boolean;
}

const ClubDetailPage: React.FC<{ userRole: UserRole | null }> = ({ userRole }) => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();

  const [club, setClub] = useState<ClubWithOwner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editableClub, setEditableClub] = useState<ClubWithOwner | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  const fetchClub = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/clubs/${clubId}`);
      const clubData = getResponseData(response);
      setClub(clubData);
      setEditableClub(clubData);
    } catch (err) {
      console.error('Error fetching club:', err);
      setError('Error al cargar el club.');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    if (clubId) fetchClub();
  }, [clubId, fetchClub]);

  const isOwner = !!club?.isOwner;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  if (error || !club) {
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
      setSaveSuccess('');
      setSaveError('');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (editableClub) {
      setEditableClub({ ...editableClub, [field]: value });
    }
  };

  const handleLegalInfoChange = (field: keyof NonNullable<Club['legalInfo']>, value: LegalSection[]) => {
    if (editableClub) {
      setEditableClub({
        ...editableClub,
        legalInfo: { ...editableClub.legalInfo, [field]: value },
      });
    }
  };

  const handleSave = async () => {
    if (!editableClub) return;
    setSaving(true);
    setSaveError('');
    try {
      await api.put(`/clubs/${clubId}`, {
        name: editableClub.name,
        slogan: editableClub.slogan,
        shortDescription: editableClub.shortDescription,
      });
      setClub(editableClub);
      setIsEditing(false);
      setSaveSuccess('¡Cambios guardados correctamente!');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch {
      setSaveError('Error al guardar los cambios. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const sectionsToText = (sections?: LegalSection[]) =>
    sections
      ? sections.map(s => (typeof s.content === 'string' ? s.content : s.content.join('\n'))).join('\n\n')
      : '';

  const textToSections = (text: string, prefix: string): LegalSection[] =>
    text.split('\n\n').map((p, i) => ({
      id: `${prefix}-${i}`,
      type: 'paragraph' as const,
      content: p,
    }));

  return (
    <div className="bg-gray-50 min-h-screen">
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
          <div className="w-full h-64 md:h-96 bg-gradient-to-br from-blue-600 to-purple-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 text-white flex items-end w-full">
          {club.logoImage && (
            <img
              src={club.logoImage}
              alt={`${club.name} Logo`}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg mr-4 object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={editableClub?.name || ''}
                onChange={e => handleInputChange('name', e.target.value)}
                className="text-4xl md:text-5xl font-extrabold w-full bg-transparent border-b-2 border-white text-white outline-none"
              />
            ) : (
              <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg">{club.name}</h1>
            )}
            {(club.slogan || isEditing) && (
              isEditing ? (
                <input
                  type="text"
                  value={editableClub?.slogan || ''}
                  onChange={e => handleInputChange('slogan', e.target.value)}
                  className="w-full bg-transparent border-b border-white text-white text-lg mt-2 outline-none"
                  placeholder="Slogan del club..."
                />
              ) : (
                <p className="text-lg md:text-xl mt-2 drop-shadow-md">{club.slogan}</p>
              )
            )}
          </div>

          {isOwner && (
            <div className="ml-4 flex gap-2 flex-shrink-0">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditToggle}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar Club
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {saveSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {saveSuccess}
          </div>
        )}
        {saveError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {saveError}
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 animate-fadeInUp">
          <div className="flex justify-between items-center mb-6">
            <span className="inline-block bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">
              {club.category}
            </span>
            {!isOwner && (
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-red-100 hover:text-red-600 transition-all duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4.5 4.5 0 015.656 0L10 6.343l1.172-1.171a4.5 4.5 0 115.656 5.656L10 17.657l-6.828-6.829a4.5 4.5 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span>Favorito</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Sobre Nosotros</h2>
              {isEditing && isOwner ? (
                <textarea
                  value={editableClub?.shortDescription || ''}
                  onChange={e => handleInputChange('shortDescription', e.target.value)}
                  className="border rounded w-full p-2 h-32 focus:ring-2 focus:ring-blue-300 outline-none"
                  placeholder="Descripción del club..."
                />
              ) : (
                <p className="text-gray-700 leading-relaxed">{club.shortDescription}</p>
              )}
            </div>
            {club.fullHistory && (
              <div className="relative group cursor-pointer">
                <img
                  src={club.mainImage || '/assets/default-banner.jpg'}
                  alt="Nuestra Historia"
                  className="w-full h-48 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link
                    to={`/club/${club.id}/history`}
                    className="text-white text-lg font-semibold px-6 py-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors duration-200"
                  >
                    Conocer Nuestra Historia
                  </Link>
                </div>
              </div>
            )}
          </div>

          {club.socialMedia && <ClubSocialMedia socialMedia={club.socialMedia} />}
        </div>

        {club.subscriptionPlans && club.subscriptionPlans.length > 0 && (
          <div className="mb-12 animate-fadeInUp delay-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Nuestros Planes de Suscripción</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {club.subscriptionPlans.map(plan => {
                const planForCard: SubscriptionPlanCardType = {
                  planId: plan.planId,
                  name: plan.name,
                  price: plan.price,
                  currency: plan.currency,
                  description: plan.description,
                  image: plan.image || '/assets/default-plan.jpg',
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

        {(club.paymentMethods || club.shippingInfo) && (
          <div className="mb-12 animate-fadeInUp delay-300">
            <ClubPaymentShippingInfo paymentMethods={club.paymentMethods} shippingInfo={club.shippingInfo} />
          </div>
        )}

        {club.featuredReviews && club.featuredReviews.length > 0 && (
          <div className="mb-12 animate-fadeInUp delay-400">
            <ClubFeaturedReviews reviews={club.featuredReviews} clubName={club.name} clubId={String(club.id)} />
          </div>
        )}

        {isEditing && isOwner && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 animate-fadeInUp">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Editar Términos y Condiciones</h2>
            <textarea
              value={sectionsToText(editableClub?.legalInfo?.termsAndConditionsSections)}
              onChange={e => handleLegalInfoChange('termsAndConditionsSections', textToSections(e.target.value, 'tc-edited'))}
              className="border rounded w-full p-2 h-48 mb-6 focus:ring-2 focus:ring-blue-300 outline-none"
              placeholder="Contenido de Términos y Condiciones..."
            />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Editar Políticas de Privacidad y Seguridad</h2>
            <textarea
              value={sectionsToText(editableClub?.legalInfo?.privacyAndSecurityPolicySections)}
              onChange={e => handleLegalInfoChange('privacyAndSecurityPolicySections', textToSections(e.target.value, 'ps-edited'))}
              className="border rounded w-full p-2 h-48 focus:ring-2 focus:ring-blue-300 outline-none"
              placeholder="Contenido de Políticas de Privacidad y Seguridad..."
            />
          </div>
        )}

        {(club.legalInfo?.termsAndConditionsSections?.length || club.legalInfo?.privacyAndSecurityPolicySections?.length) && (
          <div className="animate-fadeInUp delay-500">
            <ClubLegalInfo legalInfo={club.legalInfo} clubId={String(club.id)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubDetailPage;
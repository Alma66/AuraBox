import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Slider from 'react-slick';
import api, { getResponseData } from '../../../api/config';
import { useAuth } from '../../../App';
import { Club, LegalSection } from '../../../types/club';
import { SubscriptionPlan as SubscriptionPlanCardType } from '../../../components/club/SubscriptionPlanCard';
import SubscriptionPlanCard from '../../../components/club/SubscriptionPlanCard';
import ClubSocialMedia, { SocialMediaLinks } from '../../../components/club/ClubSocialMedia';
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

interface SocialNetworkRaw {
  id: number;
  networkType: string;
  profileUrl: string;
}

interface ClubData extends Club {
  isOwner?: boolean;
  socialNetworksRaw?: SocialNetworkRaw[];
  bannerImagesRaw?: { id: number; imageUrl: string }[];
  logoUrl?: string;
  logoImage?: string;
}

const NETWORK_TYPES = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'twitter', label: 'Twitter / X' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'pinterest', label: 'Pinterest' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'website', label: 'Sitio Web' },
];

const ClubDetailPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();

  const [club, setClub] = useState<ClubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlogan, setEditSlogan] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerUploading, setBannerUploading] = useState(false);

  const [historyImageFile, setHistoryImageFile] = useState<File | null>(null);
  const [historyImagePreview, setHistoryImagePreview] = useState<string | null>(null);
  const [historyImageUploading, setHistoryImageUploading] = useState(false);

  const [socialNetworks, setSocialNetworks] = useState<SocialNetworkRaw[]>([]);
  const [newSocialType, setNewSocialType] = useState('instagram');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [socialSaving, setSocialSaving] = useState(false);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const historyInputRef = useRef<HTMLInputElement>(null);

  const isOwner = userRole === 'entrepreneur' && !!club?.isOwner;

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchClub = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/clubs/${clubId}`);
      const data: ClubData = getResponseData(response);
      setClub(data);
      setEditName(data.name || '');
      setEditSlogan(data.slogan || '');
      setEditDescription(data.shortDescription || '');
      setSocialNetworks(data.socialNetworksRaw || []);
    } catch {
      setError('Error al cargar el club.');
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    if (clubId) fetchClub();
  }, [clubId, fetchClub]);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleLogoUpload = async () => {
    if (!logoFile || !clubId) return;
    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);
      await api.patch(`/clubs/${clubId}/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Logo actualizado correctamente');
      setLogoFile(null);
      setLogoPreview(null);
      fetchClub();
    } catch {
      showToast('Error al subir el logo', 'error');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleBannerUpload = async () => {
    if (!bannerFile || !clubId) return;
    setBannerUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', bannerFile);
      formData.append('idClub', clubId);
      formData.append('contentType', 'Imagen');
      await api.post(`/image-club`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Banner agregado correctamente');
      setBannerFile(null);
      setBannerPreview(null);
      fetchClub();
    } catch {
      showToast('Error al subir el banner', 'error');
    } finally {
      setBannerUploading(false);
    }
  };

  const handleDeleteBanner = async (imageId: number) => {
    try {
      await api.delete(`/image-club/${imageId}`);
      showToast('Banner eliminado');
      fetchClub();
    } catch {
      showToast('Error al eliminar el banner', 'error');
    }
  };

  const handleHistoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHistoryImageFile(file);
    setHistoryImagePreview(URL.createObjectURL(file));
  };

  const handleHistoryImageUpload = async () => {
    if (!historyImageFile || !clubId) return;
    setHistoryImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', historyImageFile);
      formData.append('idClub', clubId);
      formData.append('contentType', 'Imagen');
      formData.append('description', 'historia');
      await api.post(`/image-club`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Imagen de historia actualizada');
      setHistoryImageFile(null);
      setHistoryImagePreview(null);
      fetchClub();
    } catch {
      showToast('Error al subir la imagen', 'error');
    } finally {
      setHistoryImageUploading(false);
    }
  };

  const handleSaveText = async (field: 'name' | 'slogan' | 'shortDescription') => {
    if (!clubId) return;
    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      if (field === 'name') payload.name = editName;
      if (field === 'slogan') payload.slogan = editSlogan;
      if (field === 'shortDescription') payload.shortDescription = editDescription;
      await api.put(`/clubs/${clubId}`, payload);
      showToast('Guardado correctamente');
      setEditingField(null);
      fetchClub();
    } catch {
      showToast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSocial = async () => {
    if (!newSocialUrl.trim() || !clubId) return;
    setSocialSaving(true);
    try {
      await api.post(`/club-social-networks`, {
        idClub: Number(clubId),
        networkType: newSocialType,
        profileUrl: newSocialUrl.trim(),
      });
      showToast('Red social agregada');
      setNewSocialUrl('');
      setNewSocialType('instagram');
      fetchClub();
    } catch {
      showToast('Error al agregar red social', 'error');
    } finally {
      setSocialSaving(false);
    }
  };

  const handleDeleteSocial = async (id: number) => {
    try {
      await api.delete(`/club-social-networks/${id}`);
      showToast('Red social eliminada');
      fetchClub();
    } catch {
      showToast('Error al eliminar', 'error');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded mb-4" />
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4" />
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Club no encontrado</h1>
        <p className="text-lg text-gray-700 mb-8">Parece que el club que buscas no existe o fue eliminado.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  const logoSrc = logoPreview || club.logoUrl || club.logoImage || null;
  const bannerList = club.bannerImages && club.bannerImages.length > 0 ? club.bannerImages : [];
  const historyImage = club.bannerImagesRaw?.find((img) => (img as any).description === 'historia')?.imageUrl
    || club.mainImage
    || null;

  const socialMediaForDisplay: SocialMediaLinks = (socialNetworks || []).reduce(
    (acc, sn) => ({ ...acc, [sn.networkType.toLowerCase()]: sn.profileUrl }),
    {} as SocialMediaLinks,
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      <div className="relative overflow-hidden shadow-lg">
        <div className="h-56 md:h-80">
          {bannerList.length > 0 ? (
            <Slider {...bannerSliderSettings}>
              {bannerList.map((imgSrc, index) => (
                <div key={index}>
                  <img src={imgSrc} alt={`Banner ${index + 1}`} className="w-full h-56 md:h-80 object-cover object-center" />
                </div>
              ))}
            </Slider>
          ) : (
            <div className="w-full h-56 md:h-80 bg-gradient-to-br from-blue-600 to-purple-700" />
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        <div className="absolute bottom-0 left-0 w-full px-6 pb-4 flex items-end gap-4">
          <div className="relative flex-shrink-0 -mb-10">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100">
              {logoSrc ? (
                <img src={logoSrc} alt={`${club.name} logo`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                  <span className="text-white text-3xl font-bold">{club.name?.charAt(0)}</span>
                </div>
              )}
            </div>
            {isOwner && (
              <>
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 shadow hover:bg-blue-700 transition-colors"
                  title="Cambiar logo"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 019 17H7v-2a2 2 0 01.586-1.414z" />
                  </svg>
                </button>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoFileChange} />
              </>
            )}
          </div>

          <div className="flex-1 min-w-0 pb-1">
            {editingField === 'name' && isOwner ? (
              <div className="flex items-center gap-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-2xl md:text-4xl font-extrabold bg-transparent border-b-2 border-white text-white outline-none flex-1"
                  autoFocus
                />
                <button onClick={() => handleSaveText('name')} disabled={saving} className="text-green-400 hover:text-green-300 text-sm font-semibold">
                  {saving ? '...' : 'Guardar'}
                </button>
                <button onClick={() => setEditingField(null)} className="text-gray-300 hover:text-white text-sm">
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-4xl font-extrabold text-white drop-shadow-lg truncate">{club.name}</h1>
                {isOwner && (
                  <button onClick={() => setEditingField('name')} className="text-white/70 hover:text-white" title="Editar nombre">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 019 17H7v-2a2 2 0 01.586-1.414z" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {editingField === 'slogan' && isOwner ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  value={editSlogan}
                  onChange={(e) => setEditSlogan(e.target.value)}
                  className="text-base bg-transparent border-b border-white text-white outline-none flex-1"
                  placeholder="Slogan..."
                  autoFocus
                />
                <button onClick={() => handleSaveText('slogan')} disabled={saving} className="text-green-400 hover:text-green-300 text-sm font-semibold">
                  {saving ? '...' : 'Guardar'}
                </button>
                <button onClick={() => setEditingField(null)} className="text-gray-300 hover:text-white text-sm">
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                {club.slogan && <p className="text-white/90 text-sm md:text-base drop-shadow">{club.slogan}</p>}
                {isOwner && (
                  <button onClick={() => setEditingField('slogan')} className="text-white/70 hover:text-white" title="Editar slogan">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 019 17H7v-2a2 2 0 01.586-1.414z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

          {isOwner && (
            <div className="flex-shrink-0 pb-1">
              <button
                onClick={() => bannerInputRef.current?.click()}
                className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Agregar banner
              </button>
              <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerFileChange} />
            </div>
          )}
        </div>
      </div>

      {isOwner && (logoFile || bannerFile) && (
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex flex-wrap gap-3 items-center mt-10">
          {logoFile && (
            <div className="flex items-center gap-2">
              <img src={logoPreview!} alt="preview logo" className="w-10 h-10 rounded-full object-cover border-2 border-blue-300" />
              <span className="text-sm text-blue-700">Nuevo logo listo</span>
              <button onClick={handleLogoUpload} disabled={logoUploading} className="bg-blue-600 text-white text-xs px-3 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {logoUploading ? 'Subiendo...' : 'Guardar logo'}
              </button>
              <button onClick={() => { setLogoFile(null); setLogoPreview(null); }} className="text-gray-400 hover:text-gray-600 text-xs">
                Cancelar
              </button>
            </div>
          )}
          {bannerFile && (
            <div className="flex items-center gap-2">
              <img src={bannerPreview!} alt="preview banner" className="w-16 h-10 rounded object-cover border-2 border-blue-300" />
              <span className="text-sm text-blue-700">Nuevo banner listo</span>
              <button onClick={handleBannerUpload} disabled={bannerUploading} className="bg-blue-600 text-white text-xs px-3 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {bannerUploading ? 'Subiendo...' : 'Guardar banner'}
              </button>
              <button onClick={() => { setBannerFile(null); setBannerPreview(null); }} className="text-gray-400 hover:text-gray-600 text-xs">
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}

      <div className={`container mx-auto px-4 py-8 ${isOwner && !logoFile && !bannerFile ? 'mt-10' : ''}`}>
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>

        {isOwner && club.bannerImagesRaw && club.bannerImagesRaw.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Banners actuales</h3>
            <div className="flex flex-wrap gap-3">
              {club.bannerImagesRaw.map((img) => (
                <div key={img.id} className="relative group">
                  <img src={img.imageUrl} alt="banner" className="w-32 h-20 object-cover rounded-lg border border-gray-200" />
                  <button
                    onClick={() => handleDeleteBanner(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar banner"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <span className="inline-block bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">
              {club.category}
            </span>
            {!isOwner && (
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full flex items-center space-x-2 hover:bg-red-100 hover:text-red-600 transition-all">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4.5 4.5 0 015.656 0L10 6.343l1.172-1.171a4.5 4.5 0 115.656 5.656L10 17.657l-6.828-6.829a4.5 4.5 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span>Favorito</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-2xl font-bold text-gray-800">Sobre Nosotros</h2>
                {isOwner && editingField !== 'shortDescription' && (
                  <button onClick={() => setEditingField('shortDescription')} className="text-gray-400 hover:text-blue-600" title="Editar descripción">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 019 17H7v-2a2 2 0 01.586-1.414z" />
                    </svg>
                  </button>
                )}
              </div>
              {editingField === 'shortDescription' && isOwner ? (
                <div>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="border rounded w-full p-2 h-32 focus:ring-2 focus:ring-blue-300 outline-none text-sm"
                    placeholder="Descripción del club..."
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleSaveText('shortDescription')} disabled={saving} className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button onClick={() => setEditingField(null)} className="text-gray-500 text-xs hover:text-gray-700">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed">{club.shortDescription}</p>
              )}
            </div>

            <div className="relative group">
              {isOwner ? (
                <div>
                  <div className="relative cursor-pointer" onClick={() => historyInputRef.current?.click()}>
                    <img
                      src={historyImagePreview || historyImage || '/assets/default-banner.jpg'}
                      alt="Nuestra Historia"
                      className="w-full h-48 object-cover rounded-lg shadow-md group-hover:brightness-75 transition-all"
                    />
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-full">
                        Cambiar imagen
                      </span>
                    </div>
                  </div>
                  <input ref={historyInputRef} type="file" accept="image/*" className="hidden" onChange={handleHistoryImageChange} />
                  {historyImageFile && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={handleHistoryImageUpload} disabled={historyImageUploading} className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        {historyImageUploading ? 'Subiendo...' : 'Guardar imagen'}
                      </button>
                      <button onClick={() => { setHistoryImageFile(null); setHistoryImagePreview(null); }} className="text-gray-500 text-xs hover:text-gray-700">
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                club.fullHistory && (
                  <div>
                    <img
                      src={historyImage || '/assets/default-banner.jpg'}
                      alt="Nuestra Historia"
                      className="w-full h-48 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        to={`/club/${club.id}/history`}
                        className="text-white text-lg font-semibold px-6 py-3 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                      >
                        Conocer Nuestra Historia
                      </Link>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Redes Sociales</h3>

            {!isOwner && <ClubSocialMedia socialMedia={socialMediaForDisplay} />}

            {isOwner && (
              <div>
                <div className="flex flex-wrap gap-3 mb-4">
                  {socialNetworks.map((sn) => (
                    <div key={sn.id} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5">
                      <span className="text-xs font-medium text-gray-700 capitalize">{sn.networkType}</span>
                      <span className="text-xs text-gray-500 max-w-[140px] truncate">{sn.profileUrl}</span>
                      <button
                        onClick={() => handleDeleteSocial(sn.id)}
                        className="text-red-400 hover:text-red-600 ml-1"
                        title="Eliminar"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 items-end">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Red social</label>
                    <select
                      value={newSocialType}
                      onChange={(e) => setNewSocialType(e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                    >
                      {NETWORK_TYPES.map((n) => (
                        <option key={n.key} value={n.key}>{n.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs text-gray-500 mb-1">URL / Link</label>
                    <input
                      type="url"
                      value={newSocialUrl}
                      onChange={(e) => setNewSocialUrl(e.target.value)}
                      placeholder="https://..."
                      className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-300 outline-none"
                    />
                  </div>
                  <button
                    onClick={handleAddSocial}
                    disabled={socialSaving || !newSocialUrl.trim()}
                    className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {socialSaving ? 'Agregando...' : 'Agregar'}
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-1">Vista previa del cliente:</p>
                  <ClubSocialMedia socialMedia={socialMediaForDisplay} />
                </div>
              </div>
            )}
          </div>
        </div>

        {club.subscriptionPlans && club.subscriptionPlans.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Nuestros Planes de Suscripción</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {club.subscriptionPlans.map((plan) => {
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
          <div className="mb-12">
            <ClubPaymentShippingInfo paymentMethods={club.paymentMethods} shippingInfo={club.shippingInfo} />
          </div>
        )}

        {club.featuredReviews && club.featuredReviews.length > 0 && (
          <div className="mb-12">
            <ClubFeaturedReviews reviews={club.featuredReviews} clubName={club.name} clubId={String(club.id)} />
          </div>
        )}

        {(club.legalInfo?.termsAndConditionsSections?.length || club.legalInfo?.privacyAndSecurityPolicySections?.length) && (
          <div>
            <ClubLegalInfo legalInfo={club.legalInfo} clubId={String(club.id)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubDetailPage;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Slider from 'react-slick';
import Cropper from 'react-easy-crop';
import api, { getResponseData } from '../../../api/config';
import { useAuth } from '../../../App';
import { Club } from '../../../types/club';
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
  bannerImagesRaw?: { id: number; imageUrl: string; description?: string }[];
  historyImageRaw?: { id: number; imageUrl: string }[];
  logoUrl?: string;
  logoImage?: string;
}

type CropTarget = 'logo' | 'banner' | 'history';

interface CropState {
  target: CropTarget;
  imageSrc: string;
  crop: { x: number; y: number };
  zoom: number;
  croppedAreaPixels: any;
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

const ASPECT_RATIOS: Record<CropTarget, number> = {
  logo: 1,
  banner: 16 / 5,
  history: 4 / 3,
};

async function getCroppedBlob(imageSrc: string, croppedAreaPixels: any): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
      );
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas is empty'));
        },
        'image/jpeg',
        0.95,
      );
    };
    image.onerror = reject;
  });
}

const ClubDetailPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const [club, setClub] = useState<ClubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingDescription, setEditingDescription] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const [cropState, setCropState] = useState<CropState | null>(null);
  const [uploading, setUploading] = useState(false);

  const [socialNetworks, setSocialNetworks] = useState<SocialNetworkRaw[]>([]);
  const [newSocialType, setNewSocialType] = useState('instagram');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [socialSaving, setSocialSaving] = useState(false);

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

  const openCropper = (target: CropTarget, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setCropState({
        target,
        imageSrc: reader.result as string,
        crop: { x: 0, y: 0 },
        zoom: 1,
        croppedAreaPixels: null,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (target: CropTarget) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    openCropper(target, file);
    e.target.value = '';
  };

  const handleCropConfirm = async () => {
    if (!cropState || !cropState.croppedAreaPixels || !clubId) return;
    setUploading(true);
    try {
      const blob = await getCroppedBlob(cropState.imageSrc, cropState.croppedAreaPixels);
      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
      const formData = new FormData();

      if (cropState.target === 'logo') {
        formData.append('logo', file);
        await api.patch(`/clubs/${clubId}/logo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Logo actualizado correctamente');
      } else if (cropState.target === 'banner') {
        formData.append('image', file);
        formData.append('idClub', clubId);
        formData.append('contentType', 'Imagen');
        await api.post(`/image-club`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Banner agregado correctamente');
      } else if (cropState.target === 'history') {
        formData.append('image', file);
        formData.append('idClub', clubId);
        formData.append('contentType', 'Imagen');
        formData.append('description', 'historia');
        await api.post(`/image-club`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Imagen de historia actualizada');
      }

      setCropState(null);
      fetchClub();
    } catch {
      showToast('Error al subir la imagen', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDescription = async () => {
    if (!clubId) return;
    setSaving(true);
    try {
      await api.put(`/clubs/${clubId}`, { shortDescription: editDescription });
      showToast('Descripción guardada');
      setEditingDescription(false);
      fetchClub();
    } catch {
      showToast('Error al guardar', 'error');
    } finally {
      setSaving(false);
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
        <p className="text-lg text-gray-700 mb-8">El club que buscás no existe o fue eliminado.</p>
        <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all">
          Volver al inicio
        </button>
      </div>
    );
  }

  const logoSrc = club.logoUrl || club.logoImage || null;
  const bannerList = club.bannerImages && club.bannerImages.length > 0 ? club.bannerImages : [];
  const historyImage = club.historyImageRaw?.[0]?.imageUrl || null;
  const socialMediaForDisplay: SocialMediaLinks = (socialNetworks || []).reduce(
    (acc, sn) => ({ ...acc, [sn.networkType.toLowerCase()]: sn.profileUrl }),
    {} as SocialMediaLinks,
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}

      {cropState && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {cropState.target === 'logo' ? 'Ajustar logo' : cropState.target === 'banner' ? 'Ajustar banner' : 'Ajustar imagen de historia'}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">Mové y hacé zoom para encuadrar la imagen</p>
              </div>
              <button onClick={() => setCropState(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative bg-gray-900" style={{ height: cropState.target === 'logo' ? '320px' : '280px' }}>
              <Cropper
                image={cropState.imageSrc}
                crop={cropState.crop}
                zoom={cropState.zoom}
                aspect={ASPECT_RATIOS[cropState.target]}
                cropShape={cropState.target === 'logo' ? 'round' : 'rect'}
                showGrid={cropState.target !== 'logo'}
                onCropChange={(crop) => setCropState((prev) => (prev ? { ...prev, crop } : null))}
                onZoomChange={(zoom) => setCropState((prev) => (prev ? { ...prev, zoom } : null))}
                onCropComplete={(_, croppedAreaPixels) => setCropState((prev) => (prev ? { ...prev, croppedAreaPixels } : null))}
              />
            </div>
            <div className="px-6 py-4 bg-gray-50">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={cropState.zoom}
                  onChange={(e) => setCropState((prev) => (prev ? { ...prev, zoom: Number(e.target.value) } : null))}
                  className="flex-1 accent-blue-600"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setCropState(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleCropConfirm}
                  disabled={uploading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {uploading ? 'Guardando...' : 'Guardar imagen'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative shadow-lg">
        <div className="h-72 md:h-96">
          {bannerList.length > 0 ? (
            <Slider {...bannerSliderSettings}>
              {bannerList.map((imgSrc, index) => (
                <div key={index}>
                  <img src={imgSrc} alt={`Banner ${index + 1}`} className="w-full h-72 md:h-96 object-cover object-center" />
                </div>
              ))}
            </Slider>
          ) : (
            <div className="w-full h-72 md:h-96 bg-gradient-to-br from-blue-600 to-purple-700" />
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        <div className="absolute bottom-0 left-0 w-full px-6 pb-6 flex items-end gap-5">
          <div className="relative flex-shrink-0 -mb-16">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
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
                  className="absolute bottom-1 right-1 bg-white text-gray-700 rounded-full p-2 shadow-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                  title="Cambiar logo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect('logo')} />
              </>
            )}
          </div>

          <div className="flex-1 min-w-0 pb-2">
            <h1 className="text-2xl md:text-4xl font-extrabold text-white drop-shadow-lg truncate">{club.name}</h1>
            {club.slogan && <p className="text-white/85 text-sm md:text-base drop-shadow mt-1">{club.slogan}</p>}
          </div>

          {isOwner && (
            <div className="flex-shrink-0 pb-2">
              <button
                onClick={() => bannerInputRef.current?.click()}
                className="bg-white/15 hover:bg-white/25 text-white text-sm px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/30 transition-colors flex items-center gap-2 font-medium shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Cambiar banner
              </button>
              <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect('banner')} />
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 pt-20 pb-8">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium">
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>

        {isOwner && club.bannerImagesRaw && club.bannerImagesRaw.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-blue-600 rounded-full" />
              <h3 className="text-sm font-semibold text-gray-800">Banners del club</h3>
              <span className="ml-auto text-xs text-gray-400">{club.bannerImagesRaw.length} imagen{club.bannerImagesRaw.length !== 1 ? 'es' : ''}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {club.bannerImagesRaw.map((img) => (
                <div key={img.id} className="relative group">
                  <img src={img.imageUrl} alt="banner" className="w-36 h-24 object-cover rounded-xl border border-gray-100 shadow-sm" />
                  <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => handleDeleteBanner(img.id)}
                      className="bg-red-500 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-600 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
          <div className="flex justify-between items-center mb-6">
            <span className="inline-flex items-center bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-purple-100">
              {club.category}
            </span>
            {!isOwner && (
              <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4.5 4.5 0 015.656 0L10 6.343l1.172-1.171a4.5 4.5 0 115.656 5.656L10 17.657l-6.828-6.829a4.5 4.5 0 010-5.656z" clipRule="evenodd" />
                </svg>
                Guardar en favoritos
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-900">Sobre Nosotros</h2>
                {isOwner && !editingDescription && (
                  <button
                    onClick={() => setEditingDescription(true)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar descripción
                  </button>
                )}
              </div>
              {editingDescription && isOwner ? (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 h-36 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all bg-white"
                    placeholder="Contá de qué se trata tu club..."
                    autoFocus
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleSaveDescription}
                      disabled={saving}
                      className="bg-blue-600 text-white text-sm px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <button
                      onClick={() => { setEditingDescription(false); setEditDescription(club.shortDescription || ''); }}
                      className="text-gray-600 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 leading-relaxed text-sm">{club.shortDescription}</p>
              )}
            </div>

            <div>
              {isOwner ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold text-gray-900">Imagen de historia</h2>
                    <button
                      onClick={() => historyInputRef.current?.click()}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Cambiar imagen
                    </button>
                  </div>
                  {historyImage ? (
                    <img src={historyImage} alt="Historia" className="w-full h-56 object-cover rounded-xl border border-gray-100 shadow-sm" />
                  ) : (
                    <div className="w-full h-56 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-gray-400 font-medium">Sin imagen de historia</span>
                      <span className="text-xs text-gray-300">Hacé click en "Cambiar imagen" para agregar una</span>
                    </div>
                  )}
                  <input ref={historyInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect('history')} />
                </div>
              ) : (
                club.fullHistory && (
                  <div className="relative group cursor-pointer h-full min-h-[224px]">
                    <img
                      src={historyImage || '/assets/default-banner.jpg'}
                      alt="Nuestra Historia"
                      className="w-full h-56 object-cover rounded-xl shadow-sm group-hover:brightness-75 transition-all duration-300"
                    />
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Link
                        to={`/club/${club.id}/history`}
                        className="text-white text-sm font-semibold px-5 py-2.5 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                      >
                        Conocer Nuestra Historia
                      </Link>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Redes Sociales</h3>

            {!isOwner && <ClubSocialMedia socialMedia={socialMediaForDisplay} />}

            {isOwner && (
              <div>
                {socialNetworks.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {socialNetworks.map((sn) => (
                      <div key={sn.id} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                        <span className="text-xs font-semibold text-gray-700 capitalize">{sn.networkType}</span>
                        <span className="text-xs text-gray-400 max-w-[120px] truncate">{sn.profileUrl}</span>
                        <button
                          onClick={() => handleDeleteSocial(sn.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors ml-1"
                          title="Eliminar"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Agregar red social</p>
                  <div className="flex flex-wrap gap-3 items-end">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1.5">Plataforma</label>
                      <select
                        value={newSocialType}
                        onChange={(e) => setNewSocialType(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        {NETWORK_TYPES.map((n) => (
                          <option key={n.key} value={n.key}>{n.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs text-gray-500 mb-1.5">URL del perfil</label>
                      <input
                        type="url"
                        value={newSocialUrl}
                        onChange={(e) => setNewSocialUrl(e.target.value)}
                        placeholder="https://..."
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <button
                      onClick={handleAddSocial}
                      disabled={socialSaving || !newSocialUrl.trim()}
                      className="bg-blue-600 text-white text-sm px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      {socialSaving ? 'Agregando...' : 'Agregar'}
                    </button>
                  </div>
                </div>

                {socialNetworks.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-2">Vista previa para el cliente:</p>
                    <ClubSocialMedia socialMedia={socialMediaForDisplay} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {club.subscriptionPlans && club.subscriptionPlans.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Nuestros Planes de Suscripción</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <SubscriptionPlanCard key={plan.planId} plan={planForCard} clubName={club.name} detailsLink={`/club/${club.id}/plan/${plan.planId}`} />
                );
              })}
            </div>
          </div>
        )}

        {(club.paymentMethods || club.shippingInfo) && (
          <div className="mb-10">
            <ClubPaymentShippingInfo paymentMethods={club.paymentMethods} shippingInfo={club.shippingInfo} />
          </div>
        )}

        {club.featuredReviews && club.featuredReviews.length > 0 && (
          <div className="mb-10">
            <ClubFeaturedReviews reviews={club.featuredReviews} clubName={club.name} clubId={String(club.id)} />
          </div>
        )}

        {(club.legalInfo?.termsAndConditionsSections?.length || club.legalInfo?.privacyAndSecurityPolicySections?.length) && (
          <ClubLegalInfo legalInfo={club.legalInfo} clubId={String(club.id)} />
        )}
      </div>
    </div>
  );
};

export default ClubDetailPage;
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

const MAX_IMAGE_SIZE_MB: Record<CropTarget, number> = {
  logo: 8,
  banner: 12,
  history: 8,
};
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_BANNERS = 6;
const MAX_DESCRIPTION_LENGTH = 1200;
const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

function validateImageFile(file: File, target: CropTarget): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Formato no permitido. Solo se aceptan imágenes JPG, PNG o WEBP.';
  }
  const maxMb = MAX_IMAGE_SIZE_MB[target];
  if (file.size > maxMb * 1024 * 1024) {
    return `La imagen supera el tamaño máximo permitido de ${maxMb}MB.`;
  }
  if (file.size === 0) {
    return 'El archivo seleccionado está vacío o dañado.';
  }
  return null;
}

function validateSocialUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return 'Ingresá una URL antes de agregar la red social.';
  if (trimmed.length > 300) return 'La URL es demasiado larga.';
  if (!URL_REGEX.test(trimmed)) {
    return 'La URL no es válida. Debe comenzar con http:// o https:// y tener un formato correcto.';
  }
  try {
    new URL(trimmed);
  } catch {
    return 'La URL ingresada no tiene un formato válido.';
  }
  return null;
}

async function getCroppedBlob(imageSrc: string, croppedAreaPixels: any): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No se pudo procesar la imagen'));
        return;
      }
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
    image.onerror = () => reject(new Error('No se pudo cargar la imagen seleccionada'));
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
  const [descriptionError, setDescriptionError] = useState('');
  const [saving, setSaving] = useState(false);
  const [cropState, setCropState] = useState<CropState | null>(null);
  const [cropError, setCropError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [socialNetworks, setSocialNetworks] = useState<SocialNetworkRaw[]>([]);
  const [newSocialType, setNewSocialType] = useState('instagram');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [socialUrlError, setSocialUrlError] = useState('');
  const [socialSaving, setSocialSaving] = useState(false);
  const [confirmDeleteBannerId, setConfirmDeleteBannerId] = useState<number | null>(null);
  const [confirmDeleteSocialId, setConfirmDeleteSocialId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [favoritePlanIds, setFavoritePlanIds] = useState<Set<number>>(new Set());
  const [favoriteLoadingId, setFavoriteLoadingId] = useState<number | null>(null);
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

  useEffect(() => {
    const checkFavorites = async () => {
      if (userRole !== 'customer' || !club?.subscriptionPlans?.length) return;
      try {
        const results = await Promise.all(
          club.subscriptionPlans.map((plan) =>
            api.get(`/favorites/check/${plan.planId}`).then((res) => ({
              planId: Number(plan.planId),
              isFavorite: getResponseData(res)?.isFavorite ?? false,
            })),
          ),
        );
        setFavoritePlanIds(new Set(results.filter((r) => r.isFavorite).map((r) => r.planId)));
      } catch {}
    };
    checkFavorites();
  }, [club, userRole]);

  const openCropper = (target: CropTarget, file: File) => {
    const validationError = validateImageFile(file, target);
    if (validationError) {
      showToast(validationError, 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropError('');
      setCropState({
        target,
        imageSrc: reader.result as string,
        crop: { x: 0, y: 0 },
        zoom: 1,
        croppedAreaPixels: null,
      });
    };
    reader.onerror = () => showToast('No se pudo leer el archivo seleccionado.', 'error');
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (target: CropTarget) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (target === 'banner' && (club?.bannerImagesRaw?.length ?? 0) >= MAX_BANNERS) {
      showToast(`Ya alcanzaste el máximo de ${MAX_BANNERS} banners. Eliminá alguno antes de agregar otro.`, 'error');
      e.target.value = '';
      return;
    }
    openCropper(target, file);
    e.target.value = '';
  };

  const handleCropConfirm = async () => {
    if (!cropState || !clubId) return;
    if (!cropState.croppedAreaPixels) {
      setCropError('Ajustá el encuadre de la imagen antes de continuar.');
      return;
    }
    setUploading(true);
    setCropError('');
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
        formData.append('section', 'Banner');
        await api.post(`/image-club`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Banner agregado correctamente');
      } else if (cropState.target === 'history') {
        formData.append('image', file);
        formData.append('idClub', clubId);
        formData.append('contentType', 'Imagen');
        formData.append('description', 'historia');
        formData.append('section', 'Historia');
        await api.post(`/image-club`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Imagen de historia actualizada');
      }
      setCropState(null);
      fetchClub();
    } catch {
      showToast('Error al subir la imagen. Intentá nuevamente.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDescriptionChange = (value: string) => {
    if (value.length > MAX_DESCRIPTION_LENGTH) {
      setDescriptionError(`La descripción no puede superar los ${MAX_DESCRIPTION_LENGTH} caracteres.`);
      return;
    }
    setDescriptionError('');
    setEditDescription(value);
  };

  const handleSaveDescription = async () => {
    if (!clubId) return;
    const trimmed = editDescription.trim();
    if (!trimmed) {
      setDescriptionError('La descripción no puede quedar vacía.');
      return;
    }
    if (trimmed.length < 20) {
      setDescriptionError('La descripción debe tener al menos 20 caracteres para resultar informativa.');
      return;
    }
    if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
      setDescriptionError(`La descripción no puede superar los ${MAX_DESCRIPTION_LENGTH} caracteres.`);
      return;
    }
    setSaving(true);
    try {
      await api.put(`/clubs/${clubId}`, { shortDescription: trimmed });
      showToast('Descripción guardada');
      setEditingDescription(false);
      setDescriptionError('');
      fetchClub();
    } catch {
      showToast('Error al guardar la descripción.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBanner = async (imageId: number) => {
    try {
      await api.delete(`/image-club/${imageId}`);
      showToast('Banner eliminado');
      setConfirmDeleteBannerId(null);
      fetchClub();
    } catch {
      showToast('Error al eliminar el banner', 'error');
    }
  };

  const handleSocialUrlChange = (value: string) => {
    setNewSocialUrl(value);
    if (socialUrlError) setSocialUrlError('');
  };

  const handleAddSocial = async () => {
    const trimmedUrl = newSocialUrl.trim();
    const validationError = validateSocialUrl(trimmedUrl);
    if (validationError) {
      setSocialUrlError(validationError);
      return;
    }
    const alreadyExists = socialNetworks.some(
      (sn) => sn.networkType.toLowerCase() === newSocialType.toLowerCase(),
    );
    if (alreadyExists) {
      setSocialUrlError('Ya agregaste una red de este tipo. Eliminala primero si querés reemplazarla.');
      return;
    }
    if (!clubId) return;
    setSocialSaving(true);
    try {
      await api.post(`/club-social-networks`, {
        idClub: Number(clubId),
        networkType: newSocialType,
        profileUrl: trimmedUrl,
      });
      showToast('Red social agregada');
      setNewSocialUrl('');
      setSocialUrlError('');
      setNewSocialType('instagram');
      fetchClub();
    } catch {
      showToast('Error al agregar la red social', 'error');
    } finally {
      setSocialSaving(false);
    }
  };

  const handleDeleteSocial = async (id: number) => {
    try {
      await api.delete(`/club-social-networks/${id}`);
      showToast('Red social eliminada');
      setConfirmDeleteSocialId(null);
      fetchClub();
    } catch {
      showToast('Error al eliminar la red social', 'error');
    }
  };

  const handleTogglePlanFavorite = async (planId: number) => {
    setFavoriteLoadingId(planId);
    try {
      const res = await api.post(`/favorites/toggle/${planId}`);
      const isFav = getResponseData(res)?.isFavorite ?? false;
      setFavoritePlanIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(planId);
        else next.delete(planId);
        return next;
      });
    } catch {
      showToast('No se pudo actualizar favoritos', 'error');
    } finally {
      setFavoriteLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-72 bg-gray-200 rounded-2xl mb-6" />
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Club no encontrado</h1>
        <p className="text-gray-500 mb-8">El club que buscás no existe o fue eliminado.</p>
        <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm">
          Volver al inicio
        </button>
      </div>
    );
  }

  const logoSrc = club.logoUrl || club.logoImage || null;
  const bannerList = club.bannerImagesRaw && club.bannerImagesRaw.length > 0
    ? club.bannerImagesRaw.map((img) => img.imageUrl)
    : [];
  const historyImage = club.historyImageRaw?.[0]?.imageUrl || null;
  const socialMediaForDisplay: SocialMediaLinks = (socialNetworks || []).reduce(
    (acc, sn) => ({ ...acc, [sn.networkType.toLowerCase()]: sn.profileUrl }),
    {} as SocialMediaLinks,
  );
  const availableNetworkTypes = NETWORK_TYPES.filter(
    (n) => !socialNetworks.some((sn) => sn.networkType.toLowerCase() === n.key),
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {toast && (
        <div
          role="alert"
          className={`fixed top-20 right-4 z-50 max-w-sm px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}
        >
          {toast.type === 'success' ? (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
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
              <button onClick={() => setCropState(null)} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Cerrar">
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
              {cropError && (
                <p className="text-xs text-red-600 mb-3 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {cropError}
                </p>
              )}
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
                  aria-label="Zoom"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCropState(null)}
                  disabled={uploading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
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
      {confirmDeleteBannerId !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Eliminar este banner?</h3>
            <p className="text-sm text-gray-500 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteBannerId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteBanner(confirmDeleteBannerId)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmDeleteSocialId !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Eliminar esta red social?</h3>
            <p className="text-sm text-gray-500 mb-6">Dejará de mostrarse en el perfil del club.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteSocialId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteSocial(confirmDeleteSocialId)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
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
                  title="Cambiar logo (JPG, PNG o WEBP, máx. 8MB)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleFileSelect('logo')}
                />
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
                Agregar banner
              </button>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={handleFileSelect('banner')}
              />
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
              <span className="ml-auto text-xs text-gray-400">
                {club.bannerImagesRaw.length} / {MAX_BANNERS} imágenes
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {club.bannerImagesRaw.map((img) => (
                <div key={img.id} className="relative group">
                  <img src={img.imageUrl} alt="banner" className="w-36 h-24 object-cover rounded-xl border border-gray-100 shadow-sm" />
                  <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => setConfirmDeleteBannerId(img.id)}
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-gray-900">Sobre Nosotros</h2>
                {isOwner && !editingDescription && (
                  <button
                    onClick={() => { setEditDescription(club.shortDescription || ''); setDescriptionError(''); setEditingDescription(true); }}
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
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    className={`w-full border rounded-xl p-3 h-36 text-sm text-gray-700 focus:ring-2 focus:border-transparent outline-none resize-none transition-all bg-white ${descriptionError ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-blue-500'}`}
                    placeholder="Contá de qué se trata tu club..."
                    autoFocus
                    maxLength={MAX_DESCRIPTION_LENGTH}
                  />
                  <div className="flex items-center justify-between mt-1.5">
                    <span className={`text-xs ${descriptionError ? 'text-red-600' : 'text-gray-400'}`}>
                      {descriptionError || `${editDescription.length} / ${MAX_DESCRIPTION_LENGTH} caracteres`}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleSaveDescription}
                      disabled={saving}
                      className="bg-blue-600 text-white text-sm px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <button
                      onClick={() => { setEditingDescription(false); setEditDescription(club.shortDescription || ''); setDescriptionError(''); }}
                      className="text-gray-600 text-sm px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 leading-relaxed text-sm">{club.shortDescription || 'Este club todavía no cargó una descripción.'}</p>
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
                  <p className="text-xs text-gray-400 mt-2">Formatos aceptados: JPG, PNG o WEBP. Tamaño máximo {MAX_IMAGE_SIZE_MB.history}MB.</p>
                  <input
                    ref={historyInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleFileSelect('history')}
                  />
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
                          onClick={() => setConfirmDeleteSocialId(sn.id)}
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
                {availableNetworkTypes.length > 0 ? (
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Agregar red social</p>
                    <div className="flex flex-wrap gap-3 items-start">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1.5">Plataforma</label>
                        <select
                          value={newSocialType}
                          onChange={(e) => setNewSocialType(e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                          {availableNetworkTypes.map((n) => (
                            <option key={n.key} value={n.key}>{n.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs text-gray-500 mb-1.5">URL del perfil</label>
                        <input
                          type="url"
                          value={newSocialUrl}
                          onChange={(e) => handleSocialUrlChange(e.target.value)}
                          placeholder="https://instagram.com/tu_club"
                          className={`border rounded-lg px-3 py-2 text-sm w-full bg-white focus:ring-2 focus:border-transparent outline-none ${socialUrlError ? 'border-red-300 focus:ring-red-400' : 'border-gray-200 focus:ring-blue-500'}`}
                        />
                        {socialUrlError && (
                          <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {socialUrlError}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleAddSocial}
                        disabled={socialSaving || !newSocialUrl.trim()}
                        className="bg-blue-600 text-white text-sm px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm mt-px"
                      >
                        {socialSaving ? 'Agregando...' : 'Agregar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">Ya agregaste todas las redes sociales disponibles.</p>
                )}
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
                  image: plan.image && !plan.image.includes('/assets/') ? plan.image : '',
                  deliveryFrequency: plan.deliveryFrequency || '',
                  includes: plan.includes || [],
                  shippingAreas: plan.shippingAreas || '',
                  specifications: plan.specifications || [],
                  activo: plan.active,
                  cashDiscount: plan.cashDiscount,
                  transferDiscount: plan.transferDiscount,
                };
                const numericPlanId = Number(plan.planId);
                const isPlanFavorite = favoritePlanIds.has(numericPlanId);
                return (
                  <div key={plan.planId} className="relative">
                    {!isOwner && userRole === 'customer' && (
                      <button
                        onClick={() => handleTogglePlanFavorite(numericPlanId)}
                        disabled={favoriteLoadingId === numericPlanId}
                        className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-md transition-colors disabled:opacity-50 ${
                          isPlanFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-500'
                        }`}
                        title={isPlanFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                      >
                        <svg className="h-4 w-4" viewBox="0 0 20 20" fill={isPlanFavorite ? 'currentColor' : 'none'} stroke="currentColor">
                          <path strokeWidth={isPlanFavorite ? 0 : 1.5} fillRule="evenodd" d="M3.172 5.172a4.5 4.5 0 015.656 0L10 6.343l1.172-1.171a4.5 4.5 0 115.656 5.656L10 17.657l-6.828-6.829a4.5 4.5 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                    <SubscriptionPlanCard plan={planForCard} clubName={club.name} detailsLink={`/club/${club.id}/plan/${plan.planId}`} />
                  </div>
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
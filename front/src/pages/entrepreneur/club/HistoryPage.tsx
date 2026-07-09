import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import api, { getResponseData } from '../../../api/config';
import { Club, Milestone } from '../../../types/club';
import { useAuth } from '../../../App';
import ClubSocialMedia from '../../../components/club/ClubSocialMedia';

const AnimatedSection: React.FC<{ children: React.ReactNode; delay?: string }> = ({ children, delay = '0s' }) => (
  <div className="opacity-0 animate-fadeInUp" style={{ animationDelay: delay }}>
    {children}
  </div>
);

interface CropState {
  imageSrc: string;
  entrepreneurId: number;
  crop: { x: number; y: number };
  zoom: number;
  croppedAreaPixels: any;
}

const MAX_IMAGE_SIZE_MB = 8;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_TEAM_MEMBERS = 3;
const MAX_HISTORY_LENGTH = 4000;
const MAX_COMMUNITY_LENGTH = 600;
const MAX_BIO_LENGTH = 400;
const MAX_MILESTONE_DESCRIPTION_LENGTH = 280;
const MIN_MILESTONE_YEAR = 1900;
const CURRENT_YEAR = new Date().getFullYear();
const MAX_MILESTONE_YEAR = CURRENT_YEAR + 1;
const MAX_MILESTONES = 12;

function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return 'Formato no permitido. Solo se aceptan imágenes JPG, PNG o WEBP.';
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `La imagen supera el tamaño máximo permitido de ${MAX_IMAGE_SIZE_MB}MB.`;
  }
  if (file.size === 0) {
    return 'El archivo seleccionado está vacío o dañado.';
  }
  return null;
}

function validateMilestone(milestone: Milestone): string | null {
  if (Number.isNaN(milestone.year) || !Number.isInteger(milestone.year)) {
    return 'El año debe ser un número entero válido.';
  }
  if (milestone.year < MIN_MILESTONE_YEAR || milestone.year > MAX_MILESTONE_YEAR) {
    return `El año debe estar entre ${MIN_MILESTONE_YEAR} y ${MAX_MILESTONE_YEAR}.`;
  }
  if (!milestone.description || !milestone.description.trim()) {
    return 'Cada hito necesita una descripción.';
  }
  if (milestone.description.length > MAX_MILESTONE_DESCRIPTION_LENGTH) {
    return `La descripción del hito no puede superar los ${MAX_MILESTONE_DESCRIPTION_LENGTH} caracteres.`;
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
      ctx.drawImage(image, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, croppedAreaPixels.width, croppedAreaPixels.height);
      canvas.toBlob((blob) => { if (blob) resolve(blob); else reject(new Error('Canvas is empty')); }, 'image/jpeg', 0.95);
    };
    image.onerror = () => reject(new Error('No se pudo cargar la imagen seleccionada'));
  });
}

const HistoryPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditingOrigins, setIsEditingOrigins] = useState(false);
  const [tempHistory, setTempHistory] = useState('');
  const [originsError, setOriginsError] = useState('');
  const [savingOrigins, setSavingOrigins] = useState(false);

  const [isEditingMilestones, setIsEditingMilestones] = useState(false);
  const [tempMilestones, setTempMilestones] = useState<Milestone[]>([]);
  const [milestonesError, setMilestonesError] = useState('');
  const [savingMilestones, setSavingMilestones] = useState(false);

  const [isEditingCommunity, setIsEditingCommunity] = useState(false);
  const [tempCommunityText, setTempCommunityText] = useState('');
  const [communityError, setCommunityError] = useState('');
  const [savingCommunity, setSavingCommunity] = useState(false);

  const [selectedEntrepreneurIds, setSelectedEntrepreneurIds] = useState<number[]>([]);
  const [teamSelectionNotice, setTeamSelectionNotice] = useState('');
  const [editingBioId, setEditingBioId] = useState<number | null>(null);
  const [tempBio, setTempBio] = useState('');
  const [savingBioId, setSavingBioId] = useState<number | null>(null);

  const [cropState, setCropState] = useState<CropState | null>(null);
  const [uploading, setUploading] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoUploadTargetId = useRef<number | null>(null);

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchClub = useCallback(async () => {
    try {
      const response = await api.get(`/clubs/${clubId}`);
      const clubData = getResponseData(response);
      setClub(clubData);
      setTempHistory(clubData.history || '');
      setTempMilestones(clubData.milestones || []);
      setTempCommunityText(clubData.communityText || '');
      if (clubData.entrepreneurs && clubData.entrepreneurs.length > 0) {
        setSelectedEntrepreneurIds(clubData.entrepreneurs.slice(0, MAX_TEAM_MEMBERS).map((e: any) => e.id));
      }
    } catch (error) {
      console.error('Error fetching club:', error);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    if (clubId) fetchClub();
  }, [clubId, fetchClub]);

  const isOwner = userRole === 'entrepreneur' && !!club?.isOwner;

  const handleSaveOrigins = async () => {
    if (!club) return;
    const trimmed = tempHistory.trim();
    if (!trimmed) {
      setOriginsError('La historia no puede quedar vacía.');
      return;
    }
    if (trimmed.length < 30) {
      setOriginsError('Contanos un poco más: la historia debe tener al menos 30 caracteres.');
      return;
    }
    if (trimmed.length > MAX_HISTORY_LENGTH) {
      setOriginsError(`La historia no puede superar los ${MAX_HISTORY_LENGTH} caracteres.`);
      return;
    }
    setSavingOrigins(true);
    try {
      await api.put(`/clubs/${club.id}`, { history: trimmed });
      setClub({ ...club, history: trimmed, fullHistory: trimmed });
      setIsEditingOrigins(false);
      setOriginsError('');
      showToast('Historia guardada');
    } catch {
      showToast('Error al guardar la historia', 'error');
    } finally {
      setSavingOrigins(false);
    }
  };

  const handleSaveMilestones = async () => {
    if (!club) return;
    for (let i = 0; i < tempMilestones.length; i += 1) {
      const validationError = validateMilestone(tempMilestones[i]);
      if (validationError) {
        setMilestonesError(`Hito ${i + 1}: ${validationError}`);
        return;
      }
    }
    setMilestonesError('');
    setSavingMilestones(true);
    try {
      await api.put(`/clubs/${club.id}`, { milestones: JSON.stringify(tempMilestones) });
      setClub({ ...club, milestones: tempMilestones });
      setIsEditingMilestones(false);
      showToast('Hitos guardados');
    } catch {
      showToast('Error al guardar los hitos', 'error');
    } finally {
      setSavingMilestones(false);
    }
  };

  const handleAddMilestone = () => {
    if (tempMilestones.length >= MAX_MILESTONES) {
      setMilestonesError(`No podés agregar más de ${MAX_MILESTONES} hitos.`);
      return;
    }
    setMilestonesError('');
    setTempMilestones([...tempMilestones, { year: CURRENT_YEAR, description: '' }]);
  };

  const handleRemoveMilestone = (index: number) => {
    setTempMilestones(tempMilestones.filter((_, i) => i !== index));
    setMilestonesError('');
  };

  const handleMilestoneYearChange = (index: number, rawValue: string) => {
    const updated = [...tempMilestones];
    const parsed = rawValue.trim() === '' ? NaN : Number(rawValue);
    updated[index] = { ...updated[index], year: parsed };
    setTempMilestones(updated);
    if (milestonesError) setMilestonesError('');
  };

  const handleMilestoneDescriptionChange = (index: number, value: string) => {
    if (value.length > MAX_MILESTONE_DESCRIPTION_LENGTH) return;
    const updated = [...tempMilestones];
    updated[index] = { ...updated[index], description: value };
    setTempMilestones(updated);
    if (milestonesError) setMilestonesError('');
  };

  const handleSaveCommunity = async () => {
    if (!club) return;
    const trimmed = tempCommunityText.trim();
    if (!trimmed) {
      setCommunityError('El texto de comunidad no puede quedar vacío.');
      return;
    }
    if (trimmed.length > MAX_COMMUNITY_LENGTH) {
      setCommunityError(`El texto no puede superar los ${MAX_COMMUNITY_LENGTH} caracteres.`);
      return;
    }
    setSavingCommunity(true);
    try {
      await api.put(`/clubs/${club.id}`, { communityText: trimmed });
      setClub({ ...club, communityText: trimmed });
      setIsEditingCommunity(false);
      setCommunityError('');
      showToast('Texto de comunidad guardado');
    } catch {
      showToast('Error al guardar el texto de comunidad', 'error');
    } finally {
      setSavingCommunity(false);
    }
  };

  const handleSaveBio = async (entrepreneurId: number) => {
    const trimmed = tempBio.trim();
    if (trimmed.length > MAX_BIO_LENGTH) {
      showToast(`La bio no puede superar los ${MAX_BIO_LENGTH} caracteres.`, 'error');
      return;
    }
    setSavingBioId(entrepreneurId);
    try {
      await api.patch('/entrepreneurs/me', { bio: trimmed });
      setClub((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          entrepreneurs: prev.entrepreneurs?.map((e) => e.id === entrepreneurId ? { ...e, bio: trimmed } : e),
        };
      });
      setEditingBioId(null);
      showToast('Bio guardada');
    } catch {
      showToast('Error al guardar la bio', 'error');
    } finally {
      setSavingBioId(null);
    }
  };

  const toggleEntrepreneur = (id: number) => {
    setSelectedEntrepreneurIds((prev) => {
      if (prev.includes(id)) {
        setTeamSelectionNotice('');
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= MAX_TEAM_MEMBERS) {
        setTeamSelectionNotice(`Solo podés mostrar hasta ${MAX_TEAM_MEMBERS} personas en esta sección. Quitá a alguien para agregar otra.`);
        return prev;
      }
      setTeamSelectionNotice('');
      return [...prev, id];
    });
  };

  const handlePhotoClick = (entrepreneurId: number) => {
    photoUploadTargetId.current = entrepreneurId;
    photoInputRef.current?.click();
  };

  const handlePhotoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = photoUploadTargetId.current;
    if (!file || !targetId) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      showToast(validationError, 'error');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropState({
        imageSrc: reader.result as string,
        entrepreneurId: targetId,
        crop: { x: 0, y: 0 },
        zoom: 1,
        croppedAreaPixels: null,
      });
    };
    reader.onerror = () => showToast('No se pudo leer el archivo seleccionado.', 'error');
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropConfirm = async () => {
    if (!cropState || !club) return;
    if (!cropState.croppedAreaPixels) {
      showToast('Ajustá el encuadre de la imagen antes de continuar.', 'error');
      return;
    }
    setUploading(true);
    try {
      const blob = await getCroppedBlob(cropState.imageSrc, cropState.croppedAreaPixels);
      const file = new File([blob], 'team-photo.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('image', file);
      formData.append('idClub', String(club.id));
      formData.append('contentType', 'Imagen');
      formData.append('description', `team-${cropState.entrepreneurId}`);
      formData.append('section', 'Equipo');
      formData.append('uploadedBy', String(cropState.entrepreneurId));
      const existingImage = (club.historyImageRaw as any[])?.find((img) => img.description === `team-${cropState.entrepreneurId}`);
      if (existingImage) {
        await api.delete(`/image-club/${existingImage.id}`);
      }
      const response = await api.post('/image-club', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const newImage = getResponseData(response);
      setClub((prev) => {
        if (!prev) return prev;
        const filtered = ((prev.historyImageRaw as any[]) || []).filter((img) => img.description !== `team-${cropState.entrepreneurId}`);
        return {
          ...prev,
          historyImageRaw: [...filtered, { id: newImage.id, imageUrl: newImage.imageUrl, description: `team-${cropState.entrepreneurId}` }],
        };
      });
      setCropState(null);
      showToast('Foto actualizada');
    } catch {
      showToast('Error al subir la foto', 'error');
    } finally {
      setUploading(false);
    }
  };

  const getTeamPhoto = (entrepreneurId: number): string => {
    const img = (club?.historyImageRaw as any[])?.find((i) => i.description === `team-${entrepreneurId}`);
    return img?.imageUrl || '/assets/default-avatar.jpg';
  };

  if (loading) {
    return <div className="text-center py-20">Cargando historia...</div>;
  }

  if (!club) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Club no encontrado</h1>
        <p className="text-lg text-gray-700 mb-8">El club que buscás no existe o fue eliminado.</p>
        <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200">
          Volver
        </button>
      </div>
    );
  }

  const creationYear = club.creationDate ? new Date(club.creationDate).getFullYear() : null;
  const creationDateFormatted = club.creationDate
    ? new Date(club.creationDate).toLocaleDateString('es-AR', { year: 'numeric', month: 'long' })
    : 'No disponible';

  const historyText = club.history || club.fullHistory || '';
  const historyParagraphs = historyText
    ? historyText.split('\n\n').map((p) => p.trim()).filter((p) => p.length > 0)
    : [];

  const milestonesToDisplay: Milestone[] = club.milestones && club.milestones.length > 0
    ? club.milestones
    : creationYear
      ? [
          { year: creationYear, description: `Fundación de ${club.name}: Nace la idea de llevar la magia a cada hogar.` },
          { year: creationYear + 1, description: 'Primera edición especial: Lanzamiento de una caja temática, agotada en 48 horas.' },
          { year: creationYear + 2, description: 'Alcanzamos los primeros suscriptores: Nuestra comunidad no para de crecer.' },
        ]
      : [];

  const communityTextToDisplay = club.communityText || 'Más allá de las cajas, somos una familia de entusiastas. Conéctate con nosotros y otros suscriptores en nuestras redes sociales.';

  const allEntrepreneurs = club.entrepreneurs || [];
  const displayedEntrepreneurs = isOwner
    ? allEntrepreneurs.filter((e) => selectedEntrepreneurIds.includes(e.id))
    : allEntrepreneurs.slice(0, MAX_TEAM_MEMBERS);

  const teamGridClass =
    displayedEntrepreneurs.length === 1
      ? 'flex justify-center'
      : displayedEntrepreneurs.length === 2
        ? 'flex justify-center gap-8'
        : 'grid grid-cols-1 md:grid-cols-3 gap-8';

  const reviews = (club as any).featuredReviews || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      {toast && (
        <div
          role="alert"
          className={`fixed top-20 right-4 z-50 max-w-sm px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}
        >
          {toast.msg}
        </div>
      )}

      {cropState && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Ajustar foto del equipo</h3>
                <p className="text-sm text-gray-500 mt-0.5">Mové y hacé zoom para encuadrar la imagen</p>
              </div>
              <button onClick={() => setCropState(null)} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Cerrar">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative bg-gray-900" style={{ height: '320px' }}>
              <Cropper
                image={cropState.imageSrc}
                crop={cropState.crop}
                zoom={cropState.zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={(crop) => setCropState((prev) => prev ? { ...prev, crop } : null)}
                onZoomChange={(zoom) => setCropState((prev) => prev ? { ...prev, zoom } : null)}
                onCropComplete={(_, croppedAreaPixels) => setCropState((prev) => prev ? { ...prev, croppedAreaPixels } : null)}
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
                  onChange={(e) => setCropState((prev) => prev ? { ...prev, zoom: Number(e.target.value) } : null)}
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

      <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" ref={photoInputRef} className="hidden" onChange={handlePhotoFileSelect} />

      <div className="relative h-80 md:h-96 overflow-hidden shadow-xl">
        <img
          src={club.logoUrl || '/assets/default-history-banner.jpg'}
          alt={`Historia de ${club.name}`}
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-center px-4">
          <h1 className="text-white text-4xl md:text-6xl font-extrabold drop-shadow-2xl text-center animate-fadeInDown">
            La Historia de <span className="text-blue-300">{club.name}</span>
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <AnimatedSection delay="0.2s">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start space-y-6 md:space-y-0 md:space-x-8 mb-16 p-8 bg-white rounded-3xl shadow-2xl border border-blue-200 transform hover:scale-[1.01] transition-transform duration-300">
            {club.logoUrl && (
              <img src={club.logoUrl} alt={`${club.name} logo`} className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-blue-600 shadow-xl object-cover" />
            )}
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-bold text-gray-900 mb-2">{club.name}</h2>
              {club.slogan && <p className="text-2xl text-gray-700 mt-1 italic font-light">{club.slogan}</p>}
              {club.shortDescription && <p className="text-gray-600 mt-2">{club.shortDescription}</p>}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay="0.4s">
          <section className="mb-20 p-8 bg-white rounded-3xl shadow-2xl border border-purple-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-bold text-purple-800 flex-grow">Nuestros Orígenes y Valores</h3>
              {isOwner && !isEditingOrigins && (
                <button
                  onClick={() => { setTempHistory(club.history || ''); setOriginsError(''); setIsEditingOrigins(true); }}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md"
                >
                  Editar
                </button>
              )}
            </div>
            {isEditingOrigins ? (
              <div>
                <textarea
                  className={`w-full border rounded-lg p-3 text-gray-700 text-base leading-relaxed focus:outline-none focus:ring-2 h-56 resize-none ${originsError ? 'border-red-300 focus:ring-red-400' : 'border-gray-300 focus:ring-purple-400'}`}
                  value={tempHistory}
                  onChange={(e) => { if (e.target.value.length <= MAX_HISTORY_LENGTH) setTempHistory(e.target.value); if (originsError) setOriginsError(''); }}
                  maxLength={MAX_HISTORY_LENGTH}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${originsError ? 'text-red-600' : 'text-gray-400'}`}>
                    {originsError || `${tempHistory.length} / ${MAX_HISTORY_LENGTH} caracteres`}
                  </span>
                </div>
                <div className="flex justify-end gap-3 mt-3">
                  <button onClick={() => { setIsEditingOrigins(false); setOriginsError(''); }} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                    Cancelar
                  </button>
                  <button onClick={handleSaveOrigins} disabled={savingOrigins} className="px-5 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 disabled:opacity-60">
                    {savingOrigins ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-800 leading-relaxed text-lg space-y-6">
                {historyParagraphs.length > 0 ? (
                  historyParagraphs.map((para, idx) => (
                    <p key={idx} className="text-justify">{para}</p>
                  ))
                ) : (
                  <p className="text-center italic text-gray-500">No hay una historia detallada disponible para este club.</p>
                )}
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 mt-8">
                  "Cada caja es una promesa, cada entrega una conexión."
                </blockquote>
              </div>
            )}
          </section>
        </AnimatedSection>

        <AnimatedSection delay="0.8s">
          <section className="mb-20 p-8 bg-white rounded-3xl shadow-2xl border border-orange-200">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-bold text-orange-800 flex-grow">Nuestros Hitos</h3>
              {isOwner && !isEditingMilestones && (
                <button
                  onClick={() => { setTempMilestones(club.milestones || []); setMilestonesError(''); setIsEditingMilestones(true); }}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md"
                >
                  Editar
                </button>
              )}
            </div>
            {isEditingMilestones ? (
              <div>
                {milestonesError && (
                  <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {milestonesError}
                  </p>
                )}
                {tempMilestones.map((milestone, index) => {
                  const fieldError = validateMilestone(milestone);
                  return (
                    <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50 flex gap-3">
                      <div className="flex flex-col gap-2 flex-1">
                        <div>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={MIN_MILESTONE_YEAR}
                            max={MAX_MILESTONE_YEAR}
                            step={1}
                            className={`border rounded-lg px-3 py-2 w-28 text-gray-700 focus:outline-none focus:ring-2 ${fieldError && !Number.isNaN(milestone.year) ? 'border-red-300 focus:ring-red-400' : 'border-gray-300 focus:ring-orange-400'}`}
                            value={Number.isNaN(milestone.year) ? '' : milestone.year}
                            onChange={(e) => handleMilestoneYearChange(index, e.target.value)}
                            placeholder="Año"
                          />
                        </div>
                        <textarea
                          className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 h-20 resize-none"
                          value={milestone.description}
                          onChange={(e) => handleMilestoneDescriptionChange(index, e.target.value)}
                          placeholder="Descripción"
                          maxLength={MAX_MILESTONE_DESCRIPTION_LENGTH}
                        />
                        <span className="text-xs text-gray-400 self-end">{milestone.description.length} / {MAX_MILESTONE_DESCRIPTION_LENGTH}</span>
                      </div>
                      <button onClick={() => handleRemoveMilestone(index)} className="self-start text-red-500 hover:text-red-700 text-xl font-bold px-2" aria-label="Eliminar hito">
                        ×
                      </button>
                    </div>
                  );
                })}
                <button
                  onClick={handleAddMilestone}
                  disabled={tempMilestones.length >= MAX_MILESTONES}
                  className="mb-4 px-4 py-2 border border-orange-400 text-orange-700 rounded-lg hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-semibold"
                >
                  + Agregar hito ({tempMilestones.length}/{MAX_MILESTONES})
                </button>
                <div className="flex justify-end gap-3 mt-2">
                  <button onClick={() => { setIsEditingMilestones(false); setMilestonesError(''); }} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                    Cancelar
                  </button>
                  <button onClick={handleSaveMilestones} disabled={savingMilestones} className="px-5 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 disabled:opacity-60">
                    {savingMilestones ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            ) : (
              milestonesToDisplay.length > 0 ? (
                <div className="relative border-l-4 border-orange-400 pl-8 ml-4">
                  {milestonesToDisplay.map((milestone, idx) => (
                    <div key={idx} className="mb-8 relative">
                      <div className="absolute -left-10 top-0 flex items-center justify-center w-8 h-8 bg-orange-500 rounded-full text-white font-bold text-sm">
                        {milestone.year}
                      </div>
                      <div className="bg-orange-50 p-6 rounded-lg shadow-md">
                        <p className="text-gray-800 text-lg">{milestone.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center italic text-gray-500">No hay hitos cargados aún.</p>
              )
            )}
          </section>
        </AnimatedSection>

        <AnimatedSection delay="1.0s">
          <section className="mb-20 p-8 bg-white rounded-3xl shadow-2xl border border-blue-200">
            <h3 className="text-3xl font-bold text-blue-800 mb-10">Cifras que Nos Impulsan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
                <h4 className="text-xl font-semibold mb-2 text-blue-700">Rating Promedio</h4>
                <p className="text-3xl font-extrabold text-blue-600">{club.averageRating ? `${club.averageRating} / 5` : 'Sin reseñas aún'}</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
                <h4 className="text-xl font-semibold mb-2 text-blue-700">Total de Reseñas</h4>
                <p className="text-3xl font-extrabold text-blue-600">{club.totalReviews || 0}</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg shadow-md border border-blue-200">
                <h4 className="text-xl font-semibold mb-2 text-blue-700">Fecha de Creación</h4>
                <p className="text-3xl font-extrabold text-blue-600">{creationDateFormatted}</p>
              </div>
            </div>
          </section>
        </AnimatedSection>

        {allEntrepreneurs.length > 0 && (
          <AnimatedSection delay="1.2s">
            <section className="mb-20 p-8 bg-white rounded-3xl shadow-2xl border border-red-200">
              <h3 className="text-3xl font-bold text-red-800 mb-10">Conoce a Nuestro Equipo</h3>

              {isOwner && allEntrepreneurs.length > 1 && (
                <div className="mb-8 p-4 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-sm font-semibold text-red-700 mb-3">
                    Seleccioná quiénes aparecen en esta sección (máximo {MAX_TEAM_MEMBERS}): {selectedEntrepreneurIds.length}/{MAX_TEAM_MEMBERS}
                  </p>
                  {teamSelectionNotice && (
                    <p className="text-xs text-red-600 mb-3 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {teamSelectionNotice}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {allEntrepreneurs.map((e) => {
                      const isSelected = selectedEntrepreneurIds.includes(e.id);
                      const isDisabled = !isSelected && selectedEntrepreneurIds.length >= MAX_TEAM_MEMBERS;
                      return (
                        <button
                          key={e.id}
                          onClick={() => toggleEntrepreneur(e.id)}
                          disabled={isDisabled}
                          className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors duration-200 ${
                            isSelected
                              ? 'bg-red-600 text-white border-red-600'
                              : isDisabled
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-red-700 border-red-300 hover:bg-red-50'
                          }`}
                        >
                          {e.firstName} {e.lastName}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className={teamGridClass}>
                {displayedEntrepreneurs.map((member) => (
                  <div key={member.id} className={`flex flex-col items-center text-center bg-red-50 p-6 rounded-lg shadow-md border border-red-200 ${displayedEntrepreneurs.length < 3 ? 'w-full max-w-xs' : ''}`}>
                    <div className="relative mb-4">
                      <img
                        src={getTeamPhoto(member.id)}
                        alt={`${member.firstName} ${member.lastName}`}
                        className="w-32 h-32 rounded-full object-cover border-4 border-red-400 shadow-lg"
                      />
                      {isOwner && (
                        <button
                          onClick={() => handlePhotoClick(member.id)}
                          className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors duration-200"
                          title="Cambiar foto (JPG, PNG o WEBP, máx. 8MB)"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <h4 className="text-xl font-bold text-red-700">{member.firstName} {member.lastName}</h4>
                    <p className="text-md text-red-600 mb-3 italic">Emprendedor/a</p>
                    {editingBioId === member.id ? (
                      <div className="w-full">
                        <textarea
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 h-24 resize-none"
                          value={tempBio}
                          onChange={(e) => { if (e.target.value.length <= MAX_BIO_LENGTH) setTempBio(e.target.value); }}
                          placeholder="Escribí una bio..."
                          maxLength={MAX_BIO_LENGTH}
                        />
                        <p className="text-xs text-gray-400 text-right mt-1">{tempBio.length} / {MAX_BIO_LENGTH}</p>
                        <div className="flex justify-center gap-2 mt-2">
                          <button onClick={() => setEditingBioId(null)} className="px-3 py-1 border border-gray-300 rounded-lg text-gray-600 text-sm hover:bg-gray-100 transition-colors duration-200">
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveBio(member.id)}
                            disabled={savingBioId === member.id}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors duration-200 disabled:opacity-60"
                          >
                            {savingBioId === member.id ? 'Guardando...' : 'Guardar'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full">
                        {member.bio ? (
                          <p className="text-gray-700 text-sm leading-relaxed">{member.bio}</p>
                        ) : (
                          <p className="italic text-gray-400 text-sm">Sin bio aún.</p>
                        )}
                        {isOwner && (
                          <button
                            onClick={() => { setEditingBioId(member.id); setTempBio(member.bio || ''); }}
                            className="mt-3 px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold hover:bg-blue-700 transition-colors duration-200"
                          >
                            Editar bio
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </AnimatedSection>
        )}

        <AnimatedSection delay="1.4s">
          <section className="mb-20 p-8 bg-white rounded-3xl shadow-2xl border border-green-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-3xl font-bold text-green-800 flex-grow">Únete a Nuestra Comunidad</h3>
              {isOwner && !isEditingCommunity && (
                <button
                  onClick={() => { setTempCommunityText(club.communityText || ''); setCommunityError(''); setIsEditingCommunity(true); }}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md"
                >
                  Editar
                </button>
              )}
            </div>
            {isEditingCommunity ? (
              <div>
                <textarea
                  className={`w-full border rounded-lg p-3 text-gray-700 text-base focus:outline-none focus:ring-2 h-32 resize-none ${communityError ? 'border-red-300 focus:ring-red-400' : 'border-gray-300 focus:ring-green-400'}`}
                  value={tempCommunityText}
                  onChange={(e) => { if (e.target.value.length <= MAX_COMMUNITY_LENGTH) setTempCommunityText(e.target.value); if (communityError) setCommunityError(''); }}
                  maxLength={MAX_COMMUNITY_LENGTH}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${communityError ? 'text-red-600' : 'text-gray-400'}`}>
                    {communityError || `${tempCommunityText.length} / ${MAX_COMMUNITY_LENGTH} caracteres`}
                  </span>
                </div>
                <div className="flex justify-end gap-3 mt-3">
                  <button onClick={() => { setIsEditingCommunity(false); setCommunityError(''); }} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                    Cancelar
                  </button>
                  <button onClick={handleSaveCommunity} disabled={savingCommunity} className="px-5 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 disabled:opacity-60">
                    {savingCommunity ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-center text-gray-700 max-w-3xl mx-auto mb-8 text-lg">{communityTextToDisplay}</p>
                {club.socialMedia && <ClubSocialMedia socialMedia={club.socialMedia} />}
              </>
            )}
          </section>
        </AnimatedSection>

        {reviews.length > 0 && (
          <AnimatedSection delay="1.5s">
            <section className="mb-20 p-8 bg-white rounded-3xl shadow-2xl border border-yellow-200">
              <h3 className="text-3xl font-bold text-yellow-800 mb-10">Lo que dicen nuestros suscriptores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review: any, idx: number) => (
                  <div key={review.id || idx} className="bg-yellow-50 p-6 rounded-xl shadow-md border border-yellow-200 flex flex-col gap-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    {review.title && <h4 className="font-bold text-gray-800 text-base">{review.title}</h4>}
                    {review.comment && <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>}
                    <p className="text-xs text-gray-400 mt-auto">{review.userName || 'Usuario'}</p>
                  </div>
                ))}
              </div>
            </section>
          </AnimatedSection>
        )}

        <AnimatedSection delay="1.6s">
          <div className="text-center py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-3xl shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">¿Listo para ser parte de nuestra historia?</h2>
            <p className="text-xl md:text-2xl mb-10 max-w-4xl mx-auto">
              Descubrí nuestros planes de suscripción y comenzá tu propia aventura con {club.name}.
            </p>
            <Link
              to={`/club/${club.id}`}
              className="inline-block bg-white text-blue-600 px-12 py-5 rounded-full font-bold text-xl hover:bg-blue-100 transition-all duration-300 shadow-lg"
            >
              ¡Suscribite Ahora!
            </Link>
          </div>
        </AnimatedSection>

        <div className="text-center mt-16">
          <button
            onClick={() => navigate(`/club/${club.id}`)}
            className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gray-700 hover:bg-gray-800 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver a la página del Club
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
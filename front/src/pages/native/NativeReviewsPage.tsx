import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../api/config';
import { useAuth } from '../../App';
import BottomSheet from '../../components/native/BottomSheet';
import StarRating from '../../components/native/StarRating';
import { Review } from '../../types/review';
import { ClubSummary, getClubSummary } from '../../utils/dataCache';
import { getErrorMessage } from '../../utils/format';
import { tapFeedback } from '../../utils/native';

const MAX_MEDIA = 5;
const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

const NativeReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [clubs, setClubs] = useState<Record<number, ClubSummary>>({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [editing, setEditing] = useState<Review | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let active = true;
    const load = async () => {
      setLoading(true);
      setFailed(false);
      try {
        const response = await api.get(`/reviews/by-user/${userId}`);
        const list: Review[] = getResponseData(response) || [];
        const clubIds = Array.from(new Set(list.map((item) => item.idClub)));
        const results = await Promise.all(clubIds.map((id) => getClubSummary(id)));
        if (!active) return;
        const clubMap: Record<number, ClubSummary> = {};
        results.forEach((club) => {
          if (club) clubMap[club.id] = club;
        });
        setReviews(list);
        setClubs(clubMap);
      } catch {
        if (active) setFailed(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [userId, reloadKey]);

  const previews = useMemo(
    () => newFiles.map((file) => ({ url: URL.createObjectURL(file), isVideo: file.type.startsWith('video/') })),
    [newFiles],
  );

  useEffect(
    () => () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    },
    [previews],
  );

  const openEdit = (review: Review) => {
    tapFeedback();
    setEditing(review);
    setRating(review.rating);
    setTitle(review.title || '');
    setComment(review.comment || '');
    setNewFiles([]);
    setEditError('');
  };

  const closeEdit = () => {
    if (saving) return;
    setEditing(null);
    setNewFiles([]);
    setEditError('');
  };

  const existingMedia = editing?.media ?? [];

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (existingMedia.length + newFiles.length + files.length > MAX_MEDIA) {
      setEditError(`Como máximo se permiten ${MAX_MEDIA} archivos por reseña.`);
      return;
    }
    setEditError('');
    setNewFiles((previous) => [...previous, ...files]);
  };

  const handleRemoveExistingMedia = async (mediaId: number) => {
    if (!editing) return;
    try {
      const response = await api.delete(`/reviews/${editing.id}/media/${mediaId}`);
      const updated: Review = getResponseData(response);
      setEditing(updated);
      setReviews((previous) => previous.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err: any) {
      setEditError(getErrorMessage(err, 'No pudimos eliminar el archivo.'));
    }
  };

  const handleSave = async () => {
    if (!editing || saving) return;
    setSaving(true);
    setEditError('');
    try {
      const response = await api.put(`/reviews/${editing.id}`, { rating, title, comment });
      let updated: Review = getResponseData(response);
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((file) => formData.append('files', file));
        const mediaResponse = await api.post(`/reviews/${editing.id}/media`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        updated = getResponseData(mediaResponse);
      }
      setReviews((previous) => previous.map((item) => (item.id === updated.id ? updated : item)));
      setEditing(null);
      setNewFiles([]);
      toast.success('Reseña actualizada');
    } catch (err: any) {
      setEditError(getErrorMessage(err, 'No pudimos guardar los cambios.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await api.delete(`/reviews/${deleteTarget.id}`);
      const removedId = deleteTarget.id;
      setReviews((previous) => previous.filter((item) => item.id !== removedId));
      setDeleteTarget(null);
      toast.success('Reseña eliminada');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'No pudimos eliminar la reseña.'));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 px-4 py-6" role="status" aria-label="Cargando reseñas">
        {[0, 1].map((item) => (
          <div key={item} className="h-44 animate-pulse rounded-3xl bg-white shadow-aurora-sm" />
        ))}
      </div>
    );
  }

  if (failed) {
    return (
      <div role="alert" className="px-6 py-16 text-center">
        <p className="text-5xl" aria-hidden="true">📡</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-aurora-navy">No pudimos cargar tus reseñas</h1>
        <p className="mt-2 text-sm text-aurora-navy/60">Revisá tu conexión e intentá de nuevo.</p>
        <button
          type="button"
          onClick={() => {
            tapFeedback();
            setReloadKey((value) => value + 1);
          }}
          className="btn-primary mt-6"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-6xl" aria-hidden="true">⭐</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-aurora-navy">Todavía no dejaste reseñas</h1>
        <p className="mt-2 text-sm text-aurora-navy/60">Contale a la comunidad cómo fue tu experiencia con los clubes que probaste.</p>
        <button type="button" onClick={() => navigate('/customer/subscriptions')} className="btn-primary mt-6">
          Ver mis suscripciones
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 pb-8 pt-5">
      <ul className="space-y-4">
        {reviews.map((review, index) => {
          const club = clubs[review.idClub];
          const media = review.media ?? [];
          const statusLabel = review.isHidden ? 'Oculta' : review.active ? 'Publicada' : 'Inactiva';
          const statusColor = review.isHidden
            ? 'bg-red-100 text-red-700'
            : review.active
              ? 'bg-green-100 text-green-700'
              : 'bg-yellow-100 text-yellow-700';
          return (
            <li
              key={review.id}
              className="animate-fadeInUp rounded-3xl bg-white p-4 shadow-aurora-sm ring-1 ring-aurora-navy/5"
              style={{ animationDelay: `${Math.min(index, 6) * 60}ms`, animationFillMode: 'both' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-bold leading-tight text-aurora-navy">{club?.name || 'Club'}</p>
                  <p className="text-xs text-aurora-navy/50">
                    {new Date(review.reviewDate).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <StarRating value={review.rating} />
              </div>
              {review.title && <p className="mt-3 font-semibold text-aurora-navy">{review.title}</p>}
              {review.comment && <p className="selectable mt-1 text-sm leading-relaxed text-aurora-navy/70">{review.comment}</p>}
              {media.length > 0 && (
                <div className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1">
                  {media.map((item) =>
                    item.mediaType === 'Video' ? (
                      <video key={item.id} src={item.mediaUrl} controls className="h-24 w-24 shrink-0 rounded-2xl object-cover" />
                    ) : (
                      <img key={item.id} src={item.mediaUrl} alt="Foto de la reseña" loading="lazy" className="h-24 w-24 shrink-0 rounded-2xl object-cover" />
                    ),
                  )}
                </div>
              )}
              <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold ${statusColor}`}>
                {statusLabel}
                {review.isHidden ? ` · ${review.hiddenReason || 'Moderación'}` : ''}
              </span>
              <div className="mt-3 flex gap-2">
                {!review.isHidden && (
                  <button
                    type="button"
                    onClick={() => openEdit(review)}
                    className="btn-outline flex-1 !px-3 !py-2.5 !text-sm"
                  >
                    Editar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    tapFeedback();
                    setDeleteTarget(review);
                  }}
                  className="min-h-[44px] flex-1 rounded-full border-2 border-red-200 px-3 text-sm font-semibold text-red-600 transition-transform active:scale-95 active:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <BottomSheet
        open={editing !== null}
        title="Editar reseña"
        onClose={closeEdit}
        footer={
          <button type="button" onClick={handleSave} disabled={saving} className="btn-primary min-h-[48px] w-full disabled:opacity-60">
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        }
      >
        {editError && (
          <p role="alert" className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {editError}
          </p>
        )}
        <fieldset className="mb-5">
          <legend className="mb-2 text-sm font-bold text-aurora-navy">Calificación</legend>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`${value} ${value === 1 ? 'estrella' : 'estrellas'}`}
                aria-pressed={value === rating}
                onClick={() => {
                  tapFeedback();
                  setRating(value);
                }}
                className="flex h-11 w-11 items-center justify-center"
              >
                <svg className={`h-9 w-9 ${value <= rating ? 'text-aurora-gold' : 'text-aurora-navy/15'}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d={STAR_PATH} />
                </svg>
              </button>
            ))}
          </div>
        </fieldset>
        <label htmlFor="edit-review-title" className="mb-1 block text-sm font-bold text-aurora-navy">
          Título (opcional)
        </label>
        <input
          id="edit-review-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          className="input-aurora mb-4"
        />
        <label htmlFor="edit-review-comment" className="mb-1 block text-sm font-bold text-aurora-navy">
          Comentario
        </label>
        <textarea
          id="edit-review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={2000}
          rows={4}
          className="input-aurora mb-4 resize-none"
        />
        <p className="mb-2 text-sm font-bold text-aurora-navy">
          Fotos y videos ({existingMedia.length + newFiles.length} / {MAX_MEDIA})
        </p>
        {(existingMedia.length > 0 || previews.length > 0) && (
          <div className="mb-3 flex flex-wrap gap-3">
            {existingMedia.map((item) => (
              <div key={item.id} className="relative">
                {item.mediaType === 'Video' ? (
                  <video src={item.mediaUrl} muted className="h-20 w-20 rounded-2xl object-cover" />
                ) : (
                  <img src={item.mediaUrl} alt="Archivo de la reseña" className="h-20 w-20 rounded-2xl object-cover" />
                )}
                <button
                  type="button"
                  aria-label="Quitar archivo"
                  onClick={() => handleRemoveExistingMedia(item.id)}
                  className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
                >
                  ✕
                </button>
              </div>
            ))}
            {previews.map((preview, index) => (
              <div key={preview.url} className="relative">
                {preview.isVideo ? (
                  <video src={preview.url} muted className="h-20 w-20 rounded-2xl object-cover opacity-80" />
                ) : (
                  <img src={preview.url} alt="Archivo nuevo" className="h-20 w-20 rounded-2xl object-cover opacity-80" />
                )}
                <button
                  type="button"
                  aria-label="Quitar archivo"
                  onClick={() => setNewFiles((previous) => previous.filter((_, position) => position !== index))}
                  className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        {existingMedia.length + newFiles.length < MAX_MEDIA && (
          <label className="flex min-h-[48px] cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-aurora-navy/20 text-sm font-semibold text-aurora-navy/70 active:bg-aurora-cream">
            Agregar fotos o videos
            <input type="file" accept="image/*,video/*" multiple onChange={handleFilesSelected} className="hidden" />
          </label>
        )}
      </BottomSheet>

      <BottomSheet
        open={deleteTarget !== null}
        title="Eliminar reseña"
        onClose={() => {
          if (!deleting) setDeleteTarget(null);
        }}
        footer={
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="min-h-[48px] w-full rounded-full bg-red-600 font-semibold text-white transition-transform active:scale-95 disabled:opacity-60"
            >
              {deleting ? 'Eliminando…' : 'Sí, eliminar'}
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="min-h-[48px] w-full rounded-full font-semibold text-aurora-navy active:bg-aurora-cream disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-aurora-navy/75">Se va a eliminar tu reseña de forma permanente. Esta acción no se puede deshacer.</p>
      </BottomSheet>
    </div>
  );
};

export default NativeReviewsPage;
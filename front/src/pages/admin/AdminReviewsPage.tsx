import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../api/config';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

interface AdminReview {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  reviewDate: string;
  isHidden: boolean;
  hiddenReason: string | null;
  mediaCount: number;
  customer: string | null;
  club: string | null;
}

interface DialogState {
  kind: 'hide' | 'delete';
  review: AdminReview;
}

const FILTERS = [
  { id: '', label: 'Todas' },
  { id: 'hidden', label: 'Ocultas' },
];

const stars = (rating: number) => '★'.repeat(rating) + '☆'.repeat(Math.max(0, 5 - rating));

const AdminReviewsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get('filter') === 'hidden' ? 'hidden' : '';
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await api.get('/admin/reviews', { params: filter ? { filter } : {} });
      setReviews(getResponseData(res) || []);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const showAgain = async (review: AdminReview) => {
    try {
      await api.patch(`/admin/reviews/${review.id}/visibility`, { isHidden: false });
      toast.success('La reseña vuelve a ser visible.');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'No se pudo mostrar la reseña.');
    }
  };

  const confirmDialog = async (reason: string) => {
    if (!dialog) return;
    setSaving(true);
    try {
      if (dialog.kind === 'hide') {
        await api.patch(`/admin/reviews/${dialog.review.id}/visibility`, { isHidden: true, reason });
        toast.success('Reseña oculta.');
      } else {
        await api.delete(`/reviews/${dialog.review.id}`);
        toast.success('Reseña eliminada.');
      }
      setDialog(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'No se pudo completar la acción.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 px-4 py-6 lg:px-8">
      <div role="group" aria-label="Filtrar reseñas" className="inline-flex gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setSearchParams(item.id ? { filter: item.id } : {}, { replace: true })}
            className={`min-h-[44px] rounded-full px-4 text-sm font-semibold transition-colors ${
              filter === item.id ? 'bg-aurora-terracotta text-white' : 'bg-white text-aurora-navy/70 hover:text-aurora-navy'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && reviews.length === 0 && (
        <div className="animate-pulse space-y-3" aria-busy="true">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-28 rounded-2xl bg-aurora-navy/10" />
          ))}
        </div>
      )}

      {failed && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p>No se pudieron cargar las reseñas.</p>
          <button
            type="button"
            onClick={load}
            className="mt-3 min-h-[44px] rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {!failed && !loading && reviews.length === 0 && (
        <div className="rounded-2xl border border-aurora-navy/10 bg-white px-6 py-16 text-center text-sm text-aurora-navy/55">
          {filter ? 'No hay reseñas ocultas.' : 'Todavía no hay reseñas.'}
        </div>
      )}

      {!failed && reviews.length > 0 && (
        <ul className={`space-y-3 transition-opacity ${loading ? 'opacity-60' : ''}`}>
          {reviews.map((review) => (
            <li key={review.id} className="rounded-2xl border border-aurora-navy/10 bg-white p-4 shadow-aurora-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span aria-label={`${review.rating} de 5`} className="text-aurora-gold">
                      {stars(review.rating)}
                    </span>
                    {review.isHidden && (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">Oculta</span>
                    )}
                    {review.mediaCount > 0 && (
                      <span className="rounded-full bg-aurora-navy/10 px-2.5 py-0.5 text-xs font-semibold text-aurora-navy/70">
                        {review.mediaCount} archivo{review.mediaCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  {review.title && <p className="mt-1 font-semibold text-aurora-navy">{review.title}</p>}
                  {review.comment && <p className="mt-1 text-sm text-aurora-navy/70">{review.comment}</p>}
                  <p className="mt-2 text-xs text-aurora-navy/50">
                    {review.customer ?? 'Cliente eliminado'} · {review.club ?? 'Club eliminado'} ·{' '}
                    {new Date(review.reviewDate).toLocaleDateString('es-AR')}
                  </p>
                  {review.isHidden && review.hiddenReason && (
                    <p className="mt-1 text-xs text-red-700">Motivo: {review.hiddenReason}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {review.isHidden ? (
                    <button
                      type="button"
                      onClick={() => showAgain(review)}
                      className="min-h-[44px] rounded-lg bg-aurora-terracotta px-4 text-sm font-semibold text-white hover:bg-aurora-terracottaDark"
                    >
                      Volver a mostrar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDialog({ kind: 'hide', review })}
                      className="min-h-[44px] rounded-lg border border-aurora-navy/15 bg-white px-4 text-sm font-semibold text-aurora-navy hover:bg-aurora-cream"
                    >
                      Ocultar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDialog({ kind: 'delete', review })}
                    className="min-h-[44px] rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {dialog && (
        <ConfirmDialog
          title={dialog.kind === 'hide' ? 'Ocultar reseña' : 'Eliminar reseña'}
          description={
            dialog.kind === 'hide'
              ? 'La reseña deja de mostrarse en la ficha del club. Podés volver a mostrarla después.'
              : 'Se borra la reseña y sus archivos. Esta acción no se puede deshacer.'
          }
          confirmLabel={dialog.kind === 'hide' ? 'Ocultar' : 'Eliminar'}
          danger={dialog.kind === 'delete'}
          requireReason={dialog.kind === 'hide'}
          saving={saving}
          onConfirm={confirmDialog}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  );
};

export default AdminReviewsPage;
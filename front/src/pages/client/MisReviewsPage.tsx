import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import api, { getResponseData } from '../../api/config';
import ReviewCard from '../../components/client/ReviewCard';
import { User } from '../../types/user';
import { Club } from '../../types/club';
import { Review } from '../../types/review';

const MAX_MEDIA = 5;

const MisReviewsPage: React.FC = () => {
  const { user } = useAuth() as { user: User | null };
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editTitle, setEditTitle] = useState('');
  const [editComment, setEditComment] = useState('');
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        const [reviewsResponse, clubsResponse] = await Promise.all([
          api.get(`/reviews/by-user/${user.id}`),
          api.get('/clubs'),
        ]);
        setReviews(getResponseData(reviewsResponse));
        setClubs(getResponseData(clubsResponse));
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate]);

  const handleDelete = async (reviewId: number) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error al eliminar la reseña.');
    }
  };

  const getClubName = (idClub: number) => {
    const club = clubs.find((c) => String(c.id) === String(idClub));
    return club ? club.name : 'Club Desconocido';
  };

  const openEdit = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditTitle(review.title || '');
    setEditComment(review.comment || '');
    setNewFiles([]);
    setEditError('');
  };

  const closeEdit = () => {
    setEditingReview(null);
    setNewFiles([]);
    setEditError('');
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!editingReview) return;
    const totalAfter = editingReview.media.length + newFiles.length + files.length;
    if (totalAfter > MAX_MEDIA) {
      setEditError(`Como máximo se permiten ${MAX_MEDIA} archivos por reseña.`);
      e.target.value = '';
      return;
    }
    setNewFiles((prev) => [...prev, ...files]);
    e.target.value = '';
  };

  const handleRemoveNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingMedia = async (mediaId: number) => {
    if (!editingReview) return;
    try {
      const res = await api.delete(`/reviews/${editingReview.id}/media/${mediaId}`);
      const updated: Review = getResponseData(res);
      setEditingReview(updated);
      setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch {
      setEditError('No se pudo eliminar el archivo.');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingReview) return;
    setSaving(true);
    setEditError('');
    try {
      const res = await api.put(`/reviews/${editingReview.id}`, {
        rating: editRating,
        title: editTitle,
        comment: editComment,
      });
      let updated: Review = getResponseData(res);

      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((file) => formData.append('files', file));
        const mediaRes = await api.post(`/reviews/${editingReview.id}/media`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        updated = getResponseData(mediaRes);
      }

      setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      closeEdit();
    } catch (error: any) {
      const msg = error?.response?.data?.message;
      setEditError(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-aurora-cream py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aurora-terracotta mx-auto mb-4"></div>
          <p className="text-aurora-navy/70">Cargando tus reseñas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-aurora-cream py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-aurora-navy mb-2">Mis Reseñas</h1>
          <p className="text-aurora-navy/70">
            {user ? `Hola, ${user.firstName}!` : 'Tus opiniones sobre los clubes.'} Acá podés ver y gestionar tus reseñas.
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-24 w-24 text-aurora-navy/20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 className="text-lg font-semibold text-aurora-navy mb-2">No tenés reseñas aún</h3>
            <p className="text-aurora-navy/60 mb-4">¡Dejá tu opinión en los clubes que probaste!</p>
            <button
              onClick={() => navigate('/explore')}
              className="bg-aurora-terracotta text-white px-6 py-3 rounded-xl hover:bg-aurora-terracottaDark transition-colors font-semibold"
            >
              Explorar Clubes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                club={{ name: getClubName(review.idClub) }}
                onDelete={() => handleDelete(review.id)}
                onEdit={!review.isHidden ? () => openEdit(review) : undefined}
              />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/customer/profile')}
            className="bg-aurora-navy text-white px-8 py-3 rounded-xl hover:bg-aurora-navy/90 transition-colors font-semibold"
          >
            Volver a Mi Perfil
          </button>
        </div>
      </div>

      {editingReview && (
        <div className="fixed inset-0 z-50 bg-aurora-navy/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-aurora-navy/10 flex items-center justify-between">
              <h3 className="text-lg font-serif font-semibold text-aurora-navy">Editar reseña</h3>
              <button onClick={closeEdit} className="text-aurora-navy/40 hover:text-aurora-navy transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              {editError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {editError}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-aurora-navy mb-2">Calificación</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setEditRating(n)}>
                      <svg
                        className={`w-8 h-8 ${n <= editRating ? 'text-aurora-gold fill-current' : 'text-aurora-navy/20'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-aurora-navy mb-1">Título</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={120}
                  className="w-full border border-aurora-navy/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aurora-terracotta"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-aurora-navy mb-1">Comentario</label>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  className="w-full border border-aurora-navy/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-aurora-terracotta resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-aurora-navy mb-2">
                  Fotos y videos ({editingReview.media.length + newFiles.length} / {MAX_MEDIA})
                </label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {editingReview.media.map((m) => (
                    <div key={m.id} className="relative">
                      {m.mediaType === 'Video' ? (
                        <video src={m.mediaUrl} className="w-20 h-20 object-cover rounded-lg" />
                      ) : (
                        <img src={m.mediaUrl} alt="Media" className="w-20 h-20 object-cover rounded-lg" />
                      )}
                      <button
                        onClick={() => handleRemoveExistingMedia(m.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {newFiles.map((file, i) => (
                    <div key={i} className="relative">
                      <img src={URL.createObjectURL(file)} alt="Nuevo" className="w-20 h-20 object-cover rounded-lg opacity-80" />
                      <button
                        onClick={() => handleRemoveNewFile(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                {editingReview.media.length + newFiles.length < MAX_MEDIA && (
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFilesSelected}
                    className="text-sm"
                  />
                )}
              </div>
            </div>
            <div className="px-6 py-4 bg-aurora-cream flex gap-3">
              <button
                onClick={closeEdit}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl border border-aurora-navy/15 text-aurora-navy text-sm font-medium hover:bg-white disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-xl bg-aurora-terracotta text-white text-sm font-semibold hover:bg-aurora-terracottaDark disabled:opacity-50 transition-colors"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisReviewsPage;
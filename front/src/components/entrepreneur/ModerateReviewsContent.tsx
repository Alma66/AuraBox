import React, { useEffect, useMemo, useState, useCallback } from 'react';
import api, { getResponseData } from '../../api/config';
import { Review, ForbiddenWord } from '../../types/review';
import { Club } from '../../types/club';

interface ModerateReviewsContentProps {
  activeSection: string;
  club: Club;
}

interface SubscriptionTypeOption {
  id: number;
  name: string;
}

interface UserOption {
  id: number;
  firstName: string;
  lastName: string;
}

const ModerateReviewsContent: React.FC<ModerateReviewsContentProps> = ({ activeSection, club }) => {
  const idClub = Number(club.id);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hiddenReviews, setHiddenReviews] = useState<Review[]>([]);
  const [subscriptionTypes, setSubscriptionTypes] = useState<SubscriptionTypeOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [forbiddenWords, setForbiddenWords] = useState<ForbiddenWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWord, setNewWord] = useState('');

  const [filterUser, setFilterUser] = useState('all');
  const [filterSub, setFilterSub] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [filterMedia, setFilterMedia] = useState('all');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [visibleRes, hiddenRes, subsRes, wordsRes] = await Promise.all([
        api.get(`/reviews/by-club/${idClub}`),
        api.get(`/reviews/hidden-by-club/${idClub}`),
        api.get('/subscription-types', { params: { clubId: idClub } }),
        api.get(`/reviews/forbidden-words/by-club/${idClub}`),
      ]);
      const visible = getResponseData(visibleRes) || [];
      const hidden = getResponseData(hiddenRes) || [];
      setReviews(visible);
      setHiddenReviews(hidden);
      setSubscriptionTypes(getResponseData(subsRes) || []);
      setForbiddenWords(getResponseData(wordsRes) || []);

      const allUserIds = Array.from(new Set([...visible, ...hidden].map((r: Review) => r.idUser)));
      const userResults = await Promise.all(
        allUserIds.map((id) => api.get(`/users/${id}`).then((r) => getResponseData(r)).catch(() => null)),
      );
      setUsers(userResults.filter(Boolean));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [idClub]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const userName = (idUser: number) => {
    const u = users.find((x) => x.id === idUser);
    return u ? `${u.firstName} ${u.lastName}` : `Usuario #${idUser}`;
  };

  const subName = (id?: number | null) => subscriptionTypes.find((s) => s.id === id)?.name ?? 'Sin especificar';

  const hasMedia = (r: Review) => (r.media && r.media.length > 0) || !!r.mediaUrl;

  const applyFilters = useCallback(
    (list: Review[]) => {
      return list.filter((r) => {
        if (filterUser !== 'all' && String(r.idUser) !== filterUser) return false;
        if (filterSub !== 'all' && String(r.idSubscriptionTypes) !== filterSub) return false;
        if (filterRating !== 'all' && r.rating !== Number(filterRating)) return false;
        if (filterMedia === 'with' && !hasMedia(r)) return false;
        if (filterMedia === 'without' && hasMedia(r)) return false;
        if (filterFrom && new Date(r.reviewDate) < new Date(filterFrom)) return false;
        if (filterTo && new Date(r.reviewDate) > new Date(filterTo + 'T23:59:59')) return false;
        return true;
      });
    },
    [filterUser, filterSub, filterRating, filterMedia, filterFrom, filterTo],
  );

  const visibleFiltered = useMemo(() => applyFilters(reviews), [reviews, applyFilters]);
  const hiddenFiltered = useMemo(() => applyFilters(hiddenReviews), [hiddenReviews, applyFilters]);

  const unhideReview = async (id: number) => {
    try {
      await api.put(`/reviews/${id}`, { isHidden: false, hiddenReason: null });
      await fetchAll();
    } catch (err) {
      console.error(err);
      alert('Error al mostrar la reseña');
    }
  };

  const hideReview = async (id: number) => {
    try {
      await api.put(`/reviews/${id}`, { isHidden: true, hiddenReason: 'Ocultada manualmente por el club' });
      await fetchAll();
    } catch (err) {
      console.error(err);
      alert('Error al ocultar la reseña');
    }
  };

  const deleteReview = async (id: number) => {
    if (!window.confirm('¿Eliminar esta reseña permanentemente?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      await fetchAll();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar la reseña');
    }
  };

  const addForbiddenWord = async () => {
    if (!newWord.trim()) return;
    try {
      await api.post('/reviews/forbidden-words', { idClub, word: newWord.trim() });
      setNewWord('');
      await fetchAll();
    } catch (err) {
      console.error(err);
      alert('Error al agregar la palabra');
    }
  };

  const toggleWord = async (word: ForbiddenWord) => {
    try {
      await api.patch(`/reviews/forbidden-words/${word.id}/toggle`, { active: !word.active });
      await fetchAll();
    } catch (err) {
      console.error(err);
      alert('Error al actualizar la palabra');
    }
  };

  const removeWord = async (id: number) => {
    if (!window.confirm('¿Eliminar esta palabra del filtro?')) return;
    try {
      await api.delete(`/reviews/forbidden-words/${id}`);
      await fetchAll();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar la palabra');
    }
  };

  const FiltersBar = () => (
    <div className="flex flex-wrap gap-3 mb-6">
      <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className="px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm">
        <option value="all">Todos los usuarios</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
        ))}
      </select>
      <select value={filterSub} onChange={(e) => setFilterSub(e.target.value)} className="px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm">
        <option value="all">Todas las suscripciones</option>
        {subscriptionTypes.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)} className="px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm">
        <option value="all">Todas las calificaciones</option>
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>{n} estrellas</option>
        ))}
      </select>
      <select value={filterMedia} onChange={(e) => setFilterMedia(e.target.value)} className="px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm">
        <option value="all">Con o sin adjunto</option>
        <option value="with">Con foto/video</option>
        <option value="without">Sin adjunto</option>
      </select>
      <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm" />
      <span className="text-aurora-navy/40 text-sm">a</span>
      <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm" />
    </div>
  );

  const ReviewCard: React.FC<{ review: Review; isHiddenView: boolean }> = ({ review, isHiddenView }) => {
    const mediaItems = review.media && review.media.length > 0
      ? review.media
      : review.mediaUrl
        ? [{ id: -1, mediaUrl: review.mediaUrl, mediaType: review.mediaType ?? 'Imagen', order: 0 }]
        : [];

    return (
      <div className="border border-aurora-navy/10 rounded-xl p-5 bg-white">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="font-semibold text-aurora-navy">{userName(review.idUser)}</p>
            <p className="text-xs text-aurora-navy/50">{subName(review.idSubscriptionTypes)} · {new Date(review.reviewDate).toLocaleDateString('es-AR')}</p>
          </div>
          <span className="text-aurora-gold font-semibold">{review.rating} ★</span>
        </div>
        {review.title && <p className="font-medium text-aurora-navy mb-1">{review.title}</p>}
        {review.comment && <p className="text-sm text-aurora-navy/70 mb-3">{review.comment}</p>}
        {mediaItems.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {mediaItems.map((m) => (
              m.mediaType === 'Video' ? (
                <video key={m.id} src={m.mediaUrl} controls className="w-28 h-28 object-cover rounded-lg" />
              ) : (
                <img key={m.id} src={m.mediaUrl} alt="" className="w-28 h-28 object-cover rounded-lg" />
              )
            ))}
          </div>
        )}
        {isHiddenView && review.hiddenReason && (
          <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg mb-3">Motivo de ocultamiento: {review.hiddenReason}</p>
        )}
        <div className="flex gap-2">
          {isHiddenView ? (
            <button onClick={() => unhideReview(review.id)} className="text-xs font-medium px-3 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
              Volver a mostrar
            </button>
          ) : (
            <button onClick={() => hideReview(review.id)} className="text-xs font-medium px-3 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100">
              Ocultar
            </button>
          )}
          <button onClick={() => deleteReview(review.id)} className="text-xs font-medium px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">
            Eliminar
          </button>
        </div>
      </div>
    );
  };

  if (loading) return <div className="text-center py-16 text-aurora-navy/50">Cargando reseñas...</div>;

  if (activeSection === 'palabras') {
    return (
      <div className="animate-fadeInUp">
        <h2 className="text-xl font-serif font-bold text-aurora-navy mb-2">Palabras Filtro</h2>
        <p className="text-sm text-aurora-navy/60 mb-6">Las reseñas que contengan estas palabras o frases se ocultarán automáticamente de los clientes. Solo vos podés verlas en "Reseñas Ocultas" y decidir si mostrarlas o eliminarlas.</p>
        <div className="flex gap-3 mb-6 max-w-md">
          <input
            type="text"
            placeholder="Agregar palabra o frase"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            className="flex-1 px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm"
          />
          <button onClick={addForbiddenWord} className="px-4 py-2 bg-aurora-navy text-white text-sm font-medium rounded-lg hover:bg-aurora-navy/90">
            Agregar
          </button>
        </div>
        <div className="space-y-2">
          {forbiddenWords.map((w) => (
            <div key={w.id} className="flex items-center justify-between border border-aurora-navy/10 rounded-lg px-4 py-3">
              <span className={`text-sm ${w.active ? 'text-aurora-navy' : 'text-aurora-navy/30 line-through'}`}>{w.word}</span>
              <div className="flex gap-2">
                <button onClick={() => toggleWord(w)} className="text-xs font-medium px-3 py-1 rounded bg-aurora-navy/5 text-aurora-navy hover:bg-aurora-navy/10">
                  {w.active ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => removeWord(w.id)} className="text-xs font-medium px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {forbiddenWords.length === 0 && <p className="text-center py-8 text-aurora-navy/50">No hay palabras configuradas todavía.</p>}
        </div>
      </div>
    );
  }

  const list = activeSection === 'ocultas' ? hiddenFiltered : visibleFiltered;

  return (
    <div className="animate-fadeInUp">
      <h2 className="text-xl font-serif font-bold text-aurora-navy mb-6">{activeSection === 'ocultas' ? 'Reseñas Ocultas' : 'Reseñas Visibles'}</h2>
      <FiltersBar />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((r) => (
          <ReviewCard key={r.id} review={r} isHiddenView={activeSection === 'ocultas'} />
        ))}
      </div>
      {list.length === 0 && <div className="text-center py-16 text-aurora-navy/50">No hay reseñas para mostrar con estos filtros.</div>}
    </div>
  );
};

export default ModerateReviewsContent;
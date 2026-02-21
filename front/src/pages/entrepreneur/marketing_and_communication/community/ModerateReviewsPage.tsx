import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../App';
import api, { getResponseData } from '../../../../api/config';

interface Review {
  id: string;
  clubId: string;
  userId: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'blocked';
}

const BAD_WORDS_ES_AR = [
  "pelotudo", "boludo", "estúpido", "forro", "hijo de puta", "mierda", "cagada", "inútiles", "embole"
];

const ModerateReviewsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [showBlockedOnly, setShowBlockedOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'blocked'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (userRole !== 'entrepreneur' || !user?.managedClubId || user.managedClubId !== clubId) {
        navigate('/login');
        return;
      }

      try {
        const response = await api.get(`/clubs/${clubId}/reviews`);
        const reviewsData = getResponseData(response);

        const reviewsWithSystemBlock: Review[] = reviewsData.map((review: any) => {
          const lowerCaseComment = review.comment?.toLowerCase() || '';
          const containsBadWord = BAD_WORDS_ES_AR.some(word => lowerCaseComment.includes(word));
          return {
            ...review,
            isBlockedBySystem: containsBadWord,
            status: containsBadWord ? 'pending' : review.status
          };
        });

        setReviews(reviewsWithSystemBlock);
        setFilteredReviews(reviewsWithSystemBlock);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };
    if (clubId) fetchData();
  }, [clubId, user, userRole, navigate]);

  useEffect(() => {
    let tempReviews = [...reviews];

    if (showBlockedOnly) {
      tempReviews = tempReviews.filter(review => review.status === 'blocked' || (review as any).isBlockedBySystem);
    }

    if (searchTerm) {
      tempReviews = tempReviews.filter(review =>
        review.comment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      tempReviews = tempReviews.filter(review => review.status === filterStatus);
    }

    setFilteredReviews(tempReviews);
  }, [reviews, showBlockedOnly, searchTerm, filterStatus]);

  const handleReviewAction = async (reviewId: string, action: 'approve' | 'block' | 'delete') => {
    try {
      if (action === 'delete') {
        await api.delete(`/clubs/${clubId}/reviews/${reviewId}`);
        setReviews(prev => prev.filter(r => r.id !== reviewId));
      } else {
        const newStatus = action === 'approve' ? 'approved' : 'blocked';
        await api.put(`/clubs/${clubId}/reviews/${reviewId}`, { status: newStatus });
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status: newStatus } : r));
      }
    } catch (error) {
      console.error("Error updating review:", error);
      alert('Error al actualizar la reseña');
    }
  };

  if (loading) {
    return <div className="text-center py-20">Cargando reseñas...</div>;
  }

  const blockedReviewsCount = reviews.filter(r => r.status === 'blocked' || (r as any).isBlockedBySystem).length;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Moderar Reseñas</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showBlockedOnly"
              checked={showBlockedOnly}
              onChange={() => setShowBlockedOnly(!showBlockedOnly)}
              className="form-checkbox h-5 w-5 text-red-600"
            />
            <label htmlFor="showBlockedOnly" className="text-gray-700 font-medium">
              Mostrar solo bloqueadas ({blockedReviewsCount})
            </label>
          </div>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="blocked">Bloqueadas</option>
            </select>
          </div>
        </div>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="text-center py-8 text-gray-600">No hay reseñas.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map(review => (
            <div
              key={review.id}
              className={`bg-white rounded-lg shadow-md p-5 border-l-4 ${
                review.status === 'blocked' ? 'border-red-500' :
                review.status === 'pending' ? 'border-yellow-500' : 'border-green-500'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <span className="text-xl font-bold text-gray-800 mr-1">{review.rating}</span>
                  <span className="text-yellow-500">★</span>
                </div>
                {(review as any).isBlockedBySystem && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">Bloqueada sistema</span>
                )}
                {review.status === 'pending' && !(review as any).isBlockedBySystem && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Pendiente</span>
                )}
                {review.status === 'approved' && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Aprobada</span>
                )}
                {review.status === 'blocked' && !(review as any).isBlockedBySystem && (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">Bloqueada</span>
                )}
              </div>
              <p className="text-gray-700 mb-3 italic">"{review.comment}"</p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{review.userId}</span> -{' '}
                {new Date(review.date).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <div className="mt-4 flex space-x-2">
                {review.status !== 'approved' && (
                  <button
                    onClick={() => handleReviewAction(review.id, 'approve')}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    Aprobar
                  </button>
                )}
                {review.status !== 'blocked' && (
                  <button
                    onClick={() => handleReviewAction(review.id, 'block')}
                    className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                  >
                    Bloquear
                  </button>
                )}
                <button
                  onClick={() => handleReviewAction(review.id, 'delete')}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModerateReviewsPage;
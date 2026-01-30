import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import reviewsData from '../../data/reviews.json';
import clubsData from '../../data/clubs.json';
import ReviewCard from '../../components/client/ReviewCard';
import { User } from '../../types/user';
import { Club } from '../../types/club';

interface Review {
  id: string;
  clubId: string;
  userId: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved';
  isBlockedBySystem: boolean;
}

const MisReviewsPage: React.FC = () => {
  const { user } = useAuth() as { user: User | null };
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const userReviews = (reviewsData as Review[]).filter(r => r.userId === user.id);
    setReviews(userReviews);
    setClubs(clubsData as Club[]);
    setLoading(false);
  }, [user, navigate]);

  const handleDelete = (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    alert(`Editando reseña: "${review.comment}"`);
    setEditingReview(null);
  };

  const getClubName = (clubId: string) => {
    const club = clubs.find(c => c.id === clubId);
    return club ? club.name : 'Club Desconocido';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus reseñas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mis Reseñas</h1>
          <p className="text-gray-600">
            {user ? `Hola, ${user.firstName}!` : 'Tus opiniones sobre los clubes.'} Aquí puedes ver y gestionar tus reseñas.
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes reseñas aún</h3>
            <p className="text-gray-500 mb-4">¡Deja tu opinión en los clubes que has probado!</p>
            <button
              onClick={() => navigate('/explore')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
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
                club={{ name: getClubName(review.clubId) }}
                onDelete={() => handleDelete(review.id)}
                onEdit={review.status === 'pending' ? () => handleEdit(review) : undefined}
              />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/profile')}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            Volver a Mi Perfil
          </button>
        </div>
      </div>
    </div>
  );
};

export default MisReviewsPage;
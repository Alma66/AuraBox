import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../../App';
import { User } from '../../../../types/user';
import { Club } from '../../../../types/club';
import { Subscription } from '../../../../types/subscription';

import usersData from '../../../../data/user.json';
import clubsData from '../../../../data/clubs.json';
import subscriptionsData from '../../../../data/subscriptions.json';
import reviewsDataRaw from '../../../../data/reviews.json';
const reviewsData = reviewsDataRaw as Review[];

interface Review {
  id: string;
  clubId: string;
  userId: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'blocked';
  isBlockedBySystem: boolean;
}

const BAD_WORDS_ES_AR = [
  "pelotudo", "boludo", "estúpido", "forro", "hijo de puta", "mierda", "cagada", "inútiles", "embole"
];

const ModerateReviewsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, isAuthenticated, userRole } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [showBlockedOnly, setShowBlockedOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'blocked'>('all');
  const [filterSubscription, setFilterSubscription] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');

  const currentEntrepreneur = user as User;
  const managedClub = clubsData.find(c => c.id === currentEntrepreneur?.managedClubId) as Club;

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'entrepreneur' || !clubId || currentEntrepreneur?.managedClubId !== clubId) {
      return;
    }

    const clubReviews = reviewsData.filter(review => review.clubId === clubId);

    const reviewsWithSystemBlock: Review[] = clubReviews.map(review => {
      const lowerCaseComment = review.comment.toLowerCase();
      const containsBadWord = BAD_WORDS_ES_AR.some(word => lowerCaseComment.includes(word));
      return {
        ...review,
        isBlockedBySystem: containsBadWord,
        status: containsBadWord ? 'pending' as const : review.status
      };
    });

    setReviews(reviewsWithSystemBlock);
    setFilteredReviews(reviewsWithSystemBlock);
  }, [isAuthenticated, userRole, clubId, currentEntrepreneur]);

  const clubSubscriptions = useMemo(() => {
    return (subscriptionsData as Subscription[]).filter(sub => sub.clubId === clubId);
  }, [clubId]);

  useEffect(() => {
    let tempReviews = reviews;

    if (showBlockedOnly) {
      tempReviews = tempReviews.filter(review => review.status === 'blocked' || review.isBlockedBySystem);
    }

    if (searchTerm) {
      tempReviews = tempReviews.filter(review =>
        review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usersData.find(u => u.id === review.userId)?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usersData.find(u => u.id === review.userId)?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      tempReviews = tempReviews.filter(review => review.status === filterStatus);
    }

    if (filterSubscription !== 'all') {
      tempReviews = tempReviews.filter(review => {
        const userHasSubscription = clubSubscriptions.some(sub => sub.userId === review.userId && sub.id === filterSubscription);
        return userHasSubscription;
      });
    }

    if (filterDate) {
      tempReviews = tempReviews.filter(review => review.date.startsWith(filterDate));
    }

    setFilteredReviews(tempReviews);
  }, [reviews, showBlockedOnly, searchTerm, filterStatus, filterSubscription, filterDate, clubSubscriptions]);

  const handleReviewAction = (reviewId: string, action: 'approve' | 'block' | 'delete') => {
    setReviews(prevReviews => {
      const updatedReviews: Review[] = prevReviews.map(review => {
        if (review.id === reviewId) {
          if (action === 'approve') {
            return { ...review, status: 'approved' as const, isBlockedBySystem: false };
          } else if (action === 'block') {
            return { ...review, status: 'blocked' as const, isBlockedBySystem: true };
          }
        }
        return review;
      }).filter(review => action !== 'delete' || review.id !== reviewId) as Review[];
      return updatedReviews;
    });
  };

  const getReviewerName = (userId: string) => {
    const user = usersData.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Usuario Desconocido';
  };

  if (!isAuthenticated || userRole !== 'entrepreneur' || !managedClub) {
    return <div className="text-center py-8 text-red-500">Acceso denegado o club no encontrado.</div>;
  }

  const blockedReviewsCount = reviews.filter(r => r.status === 'blocked' || r.isBlockedBySystem).length;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Moderar Reseñas de {managedClub.name}</h1>

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
              Mostrar solo reseñas bloqueadas ({blockedReviewsCount})
            </label>
            {blockedReviewsCount > 0 && (
              <span className="text-red-500 text-sm ml-2">
                <svg className="inline-block h-5 w-5 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                ¡Hay reseñas bloqueadas pendientes de revisión!
              </span>
            )}
          </div>
          <input
            type="text"
            placeholder="Buscar por comentario o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700">Estado:</label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'approved' | 'blocked')}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="blocked">Bloqueadas</option>
            </select>
          </div>
          <div>
            <label htmlFor="filterSubscription" className="block text-sm font-medium text-gray-700">Suscripción:</label>
            <select
              id="filterSubscription"
              value={filterSubscription}
              onChange={(e) => setFilterSubscription(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas las suscripciones</option>
              {clubSubscriptions.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.id} (Usuario: {getReviewerName(sub.userId)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filterDate" className="block text-sm font-medium text-gray-700">Fecha (AAAA-MM):</label>
            <input
              type="month"
              id="filterDate"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-4">
          <svg className="inline-block h-4 w-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Las reseñas bloqueadas no serán visibles en el perfil del club. Las reseñas bloqueadas no revisadas se eliminarán automáticamente después de 60 días.
        </p>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="text-center py-8 text-gray-600">No hay reseñas para mostrar con los filtros actuales.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map(review => (
            <div
              key={review.id}
              className={`bg-white rounded-lg shadow-md p-5 border-l-4 ${
                review.status === 'blocked' || review.isBlockedBySystem
                  ? 'border-red-500'
                  : review.status === 'pending'
                  ? 'border-yellow-500'
                  : 'border-green-500'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <span className="text-xl font-bold text-gray-800 mr-1">{review.rating}</span>
                  <span className="text-yellow-500">★</span>
                </div>
                {review.isBlockedBySystem && (
                  <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                    Bloqueada por sistema
                  </span>
                )}
                {review.status === 'pending' && !review.isBlockedBySystem && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    Pendiente
                  </span>
                )}
                {review.status === 'approved' && (
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    Aprobada
                  </span>
                )}
                {review.status === 'blocked' && !review.isBlockedBySystem && (
                  <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    Bloqueada manualmente
                  </span>
                )}
              </div>
              <p className="text-gray-700 mb-3 italic">"{review.comment}"</p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{getReviewerName(review.userId)}</span> -{' '}
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
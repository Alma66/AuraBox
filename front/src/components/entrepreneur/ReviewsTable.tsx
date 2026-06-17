import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types/user';

interface Review {
  id: number;
  idClub: number;
  idUser: number;
  rating: number;
  title?: string;
  comment?: string;
  reviewDate: string;
  active: boolean;
}

interface ReviewsTableProps {
  reviews: Review[];
  usersData: User[];
  clubId: string;
}

const ReviewsTable: React.FC<ReviewsTableProps> = ({ reviews, usersData, clubId }) => {
  const getUserName = (idUser: number) => {
    const user = usersData.find(u => Number(u.id) === idUser);
    return user ? `${user.firstName} ${user.lastName}` : 'Anónimo';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <h3 className="text-lg font-semibold text-gray-800 p-6 border-b border-gray-200">Reseñas Recientes</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comentario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getUserName(review.idUser)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="text-yellow-500">{review.rating} ★</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={review.comment}>
                  {review.comment}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(review.reviewDate).toLocaleDateString('es-AR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    review.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {review.active ? 'Aprobada' : 'Inactiva'}
                  </span>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No hay reseñas recientes para mostrar.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {reviews.length > 5 && (
        <div className="px-6 py-4 bg-gray-50 text-center">
          <Link to={`/entrepreneur/club/${clubId}/moderate-reviews`} className="text-blue-600 hover:underline">
            Ver Todas las Reseñas
          </Link>
        </div>
      )}
    </div>
  );
};

export default ReviewsTable;
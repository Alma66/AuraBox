import React from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { FeedbackTrendsData, ReviewHighlight } from '../../types/analystics';

interface FeedbackTrendsContentProps {
  activeSection: string;
  data: FeedbackTrendsData;
  clubId: string;
}

const ReviewCard: React.FC<{ review: ReviewHighlight; positive: boolean }> = ({ review, positive }) => (
  <div className={`border rounded-xl p-4 ${positive ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
    <div className="flex items-center gap-2 mb-2">
      <span className="text-yellow-500 font-bold">{review.rating} ★</span>
      {review.title && <span className="text-sm font-semibold text-gray-800">{review.title}</span>}
    </div>
    {review.comment && <p className="text-sm text-gray-600 line-clamp-3">{review.comment}</p>}
    <p className="text-xs text-gray-400 mt-2">
      {review.reviewDate ? new Date(review.reviewDate).toLocaleDateString('es-AR') : ''}
    </p>
  </div>
);

const FeedbackTrendsContent: React.FC<FeedbackTrendsContentProps> = ({ activeSection, data, clubId }) => {
  if (activeSection === 'rating') {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Tendencias de Rating</h2>
        <div className="border border-blue-100 bg-blue-50 rounded-xl px-5 py-4 inline-block">
          <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">Tasa de conversión a reseña</p>
          <p className="text-3xl font-bold text-blue-700">{data.reviewConversionRate}%</p>
          <p className="text-xs text-blue-500 mt-1">de suscriptores históricos dejaron una reseña</p>
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-700 mb-3">Rating promedio por mes (12 meses)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.ratingEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="avgRating" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Rating promedio" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (activeSection === 'altas-bajas') {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Altas y Bajas de Suscriptores</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.subscriberFlux}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="newSubs" name="Altas" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cancelledSubs" name="Bajas" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (activeSection === 'destacadas') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Reseñas Destacadas</h2>
          <Link
            to={`/entrepreneur/club/${clubId}/moderate-reviews`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Ir a Moderar Reseñas →
          </Link>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-green-700 mb-3">Las mejores</h3>
          {data.topReviews.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay reseñas positivas registradas.</p>
          ) : (
            <div className="space-y-3">
              {data.topReviews.map((r) => <ReviewCard key={r.id} review={r} positive={true} />)}
            </div>
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-red-700 mb-3">Las peores</h3>
          {data.bottomReviews.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay reseñas negativas registradas.</p>
          ) : (
            <div className="space-y-3">
              {data.bottomReviews.map((r) => <ReviewCard key={r.id} review={r} positive={false} />)}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeSection === 'palabras') {
    const max = data.frequentWords[0]?.count ?? 1;
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Palabras Frecuentes en Reseñas</h2>
        {data.frequentWords.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay suficientes reseñas para analizar palabras.</p>
        ) : (
          <div className="flex flex-wrap gap-3 items-end">
            {data.frequentWords.map((w) => {
              const size = 12 + Math.round((w.count / max) * 20);
              return (
                <span
                  key={w.word}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium"
                  style={{ fontSize: `${size}px` }}
                  title={`${w.count} apariciones`}
                >
                  {w.word}
                </span>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default FeedbackTrendsContent;
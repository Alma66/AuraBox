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
    const evo = data.ratingEvolution;
    const best = [...evo].sort((a, b) => b.avgRating - a.avgRating)[0];
    const worst = [...evo].sort((a, b) => a.avgRating - b.avgRating)[0];
    const lastMonth = evo[evo.length - 1];
    const historicAvg = evo.length > 0 ? evo.reduce((s, r) => s + r.avgRating, 0) / evo.length : 0;
    const allReviews = [...data.topReviews, ...data.bottomReviews];
    const pos = allReviews.filter((r) => r.rating >= 4).length;
    const neg = allReviews.filter((r) => r.rating <= 2).length;
    const total = allReviews.length;
    const nps = total > 0 ? (((pos / total) * 100) - ((neg / total) * 100)).toFixed(0) : '—';
    const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: allReviews.filter((r) => r.rating === star).length,
    }));

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Tendencias de Rating</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-blue-100 bg-blue-50 rounded-xl px-5 py-4">
            <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">Tasa de conversión a reseña</p>
            <p className="text-3xl font-bold text-blue-700">{data.reviewConversionRate}%</p>
            <p className="text-xs text-blue-500 mt-1">de suscriptores dejaron una reseña</p>
          </div>
          <div className="border border-indigo-200 bg-indigo-50 rounded-xl px-5 py-4">
            <p className="text-xs text-indigo-600 uppercase tracking-wide mb-1">NPS Estimado</p>
            <p className="text-3xl font-bold text-indigo-700">{nps}</p>
            <p className="text-xs text-indigo-500 mt-1">% 4-5★ menos % 1-2★</p>
          </div>
          {lastMonth && (
            <div className={`rounded-xl px-5 py-4 border ${lastMonth.avgRating >= historicAvg ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
              <p className={`text-xs uppercase tracking-wide mb-1 ${lastMonth.avgRating >= historicAvg ? 'text-green-600' : 'text-orange-600'}`}>
                Último mes vs promedio histórico
              </p>
              <p className={`text-3xl font-bold ${lastMonth.avgRating >= historicAvg ? 'text-green-700' : 'text-orange-700'}`}>
                {lastMonth.avgRating.toFixed(1)} ★
              </p>
              <p className={`text-xs mt-1 ${lastMonth.avgRating >= historicAvg ? 'text-green-500' : 'text-orange-500'}`}>
                {lastMonth.avgRating >= historicAvg ? '▲' : '▼'} histórico: {historicAvg.toFixed(1)} ★
              </p>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-700 mb-3">Rating promedio por mes (12 meses)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={evo}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="avgRating" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="Rating promedio" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {best && (
            <div className="border border-green-200 bg-green-50 rounded-xl p-5">
              <p className="text-xs text-green-600 uppercase tracking-wide mb-1">Mes con mejor rating</p>
              <p className="text-2xl font-bold text-green-700">{best.month}</p>
              <p className="text-sm text-green-600 mt-1">{best.avgRating.toFixed(1)} ★ promedio</p>
            </div>
          )}
          {worst && (
            <div className="border border-red-200 bg-red-50 rounded-xl p-5">
              <p className="text-xs text-red-600 uppercase tracking-wide mb-1">Mes con peor rating</p>
              <p className="text-2xl font-bold text-red-700">{worst.month}</p>
              <p className="text-sm text-red-600 mt-1">{worst.avgRating.toFixed(1)} ★ promedio</p>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-700 mb-3">Distribución de ratings (muestra)</h3>
          <div className="space-y-2">
            {ratingDist.map((r) => (
              <div key={r.star} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-8 flex-shrink-0">{r.star} ★</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3">
                  <div
                    className="bg-yellow-400 h-3 rounded-full transition-all"
                    style={{ width: total > 0 ? `${(r.count / total) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'altas-bajas') {
    const flux = data.subscriberFlux;
    const netByMonth = flux.map((r) => ({ ...r, neto: r.newSubs - r.cancelledSubs }));
    const bestNet = [...netByMonth].sort((a, b) => b.neto - a.neto)[0];
    const worstNet = [...netByMonth].sort((a, b) => a.neto - b.neto)[0];

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Altas y Bajas de Suscriptores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bestNet && (
            <div className="border border-green-200 bg-green-50 rounded-xl p-5">
              <p className="text-xs text-green-600 uppercase tracking-wide mb-1">Mayor crecimiento neto</p>
              <p className="text-2xl font-bold text-green-700">{bestNet.month}</p>
              <p className="text-sm text-green-600 mt-1">+{bestNet.neto} suscriptores netos</p>
            </div>
          )}
          {worstNet && (
            <div className="border border-red-200 bg-red-50 rounded-xl p-5">
              <p className="text-xs text-red-600 uppercase tracking-wide mb-1">Mayor pérdida neta</p>
              <p className="text-2xl font-bold text-red-700">{worstNet.month}</p>
              <p className="text-sm text-red-600 mt-1">{worstNet.neto} suscriptores netos</p>
            </div>
          )}
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={flux}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="newSubs" name="Altas" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cancelledSubs" name="Bajas" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div>
          <h3 className="text-base font-semibold text-gray-700 mb-3">Detalle mes a mes</h3>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Altas</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Bajas</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Saldo neto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {netByMonth.map((r) => (
                  <tr key={r.month} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-700">{r.month}</td>
                    <td className="px-4 py-2 text-right font-medium text-green-600">{r.newSubs}</td>
                    <td className="px-4 py-2 text-right font-medium text-red-500">{r.cancelledSubs}</td>
                    <td className={`px-4 py-2 text-right font-bold ${r.neto > 0 ? 'text-green-600' : r.neto < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                      {r.neto > 0 ? '+' : ''}{r.neto}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
        {[...data.topReviews, ...data.bottomReviews].filter((r) => r.mediaUrl).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Reseñas con multimedia</h3>
            <div className="space-y-3">
              {[...data.topReviews, ...data.bottomReviews]
                .filter((r) => r.mediaUrl)
                .map((r) => <ReviewCard key={`media-${r.id}`} review={r} positive={r.rating >= 4} />)}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeSection === 'palabras') {
    const words = data.frequentWords;
    const max = words[0]?.count ?? 1;
    const top10 = words.slice(0, 10);
    const posWords = [...data.topReviews].flatMap((r) =>
      (r.comment ?? '').toLowerCase().split(/\s+/).filter((w) => w.length > 3)
    );
    const negWords = [...data.bottomReviews].flatMap((r) =>
      (r.comment ?? '').toLowerCase().split(/\s+/).filter((w) => w.length > 3)
    );
    const countWords = (arr: string[]) => {
      const map: Record<string, number> = {};
      arr.forEach((w) => { map[w] = (map[w] ?? 0) + 1; });
      return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
    };
    const posTop = countWords(posWords);
    const negTop = countWords(negWords);

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Palabras Frecuentes en Reseñas</h2>
        {words.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay suficientes reseñas para analizar palabras.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 items-end">
              {words.map((w) => {
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
            <div>
              <h3 className="text-base font-semibold text-gray-700 mb-3">Top 10 palabras</h3>
              <div className="space-y-2">
                {top10.map((w) => (
                  <div key={w.word} className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 w-28 flex-shrink-0 font-medium">{w.word}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${(w.count / max) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{w.count}</span>
                  </div>
                ))}
              </div>
            </div>
            {(posTop.length > 0 || negTop.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-green-700 mb-3">Palabras en reseñas 4-5 ★</h3>
                  <div className="space-y-2">
                    {posTop.map(([word, count]) => (
                      <div key={word} className="flex items-center justify-between border border-green-100 bg-green-50 rounded-lg px-3 py-2">
                        <span className="text-sm text-gray-700">{word}</span>
                        <span className="text-xs font-semibold text-green-700">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-red-700 mb-3">Palabras en reseñas 1-2 ★</h3>
                  <div className="space-y-2">
                    {negTop.map(([word, count]) => (
                      <div key={word} className="flex items-center justify-between border border-red-100 bg-red-50 rounded-lg px-3 py-2">
                        <span className="text-sm text-gray-700">{word}</span>
                        <span className="text-xs font-semibold text-red-700">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  if (activeSection === 'media') {
    const allReviews = [...data.topReviews, ...data.bottomReviews];
    const conMedia = allReviews.filter((r) => r.mediaUrl);
    const sinMedia = allReviews.filter((r) => !r.mediaUrl);
    const total = allReviews.length;
    const pctConMedia = total > 0 ? ((conMedia.length / total) * 100).toFixed(1) : '0.0';
    const galeria = conMedia.slice(0, 12);

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Reseñas con Media</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-blue-200 bg-blue-50 rounded-xl p-5">
            <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">Con multimedia</p>
            <p className="text-3xl font-bold text-blue-700">{conMedia.length}</p>
            <p className="text-xs text-blue-500 mt-1">{pctConMedia}% del total</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Sin multimedia</p>
            <p className="text-3xl font-bold text-gray-900">{sinMedia.length}</p>
          </div>
          <div className="border border-gray-200 rounded-xl p-5 bg-white">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total de la muestra</p>
            <p className="text-3xl font-bold text-gray-900">{total}</p>
          </div>
        </div>
        {galeria.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay reseñas con multimedia en la muestra actual.</p>
        ) : (
          <div>
            <h3 className="text-base font-semibold text-gray-700 mb-3">Galería (hasta 12)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {galeria.map((r) => (
                <div key={r.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <a href={r.mediaUrl!} target="_blank" rel="noopener noreferrer">
                    <img
                      src={r.mediaUrl!}
                      alt={r.title ?? 'Reseña con media'}
                      className="w-full h-28 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </a>
                  <div className="p-2">
                    <span className="text-xs font-semibold text-yellow-500">{r.rating} ★</span>
                    {r.title && <p className="text-xs text-gray-600 truncate mt-0.5">{r.title}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default FeedbackTrendsContent;
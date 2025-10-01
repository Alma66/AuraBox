// FileName: src/components/entrepreneur/AdminToolsContent.tsx
import React, { useMemo } from 'react';
import { Club } from '../../types/club';
import { User } from '../../types/user';
import { Subscription } from '../../types/subscription';

// Importar datos simulados
import clubsData from '../../data/clubs.json';
import subscriptionsData from '../../data/subscriptions.json';
import reviewsData from '../../data/reviews.json';
import analyticsData from '../../data/analytics.json'; // Si existe; si no, se calculará dinámicamente
import usersData from '../../data/user.json'; // Corregido: asume 'users.json'

interface AdminToolsContentProps {
  activeSection: string;
  club: Club;
  user: User;
}

// Interfaz para Review si no existe en types
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

// Interfaz para monthlyExpenses (para tipado en map)
interface MonthlyExpense {
  month: string;
  amount: number;
}

const AdminToolsContent: React.FC<AdminToolsContentProps> = ({ activeSection, club, user }) => {
  // Calcular métricas dinámicamente de los datos existentes
  const clubSubscriptions = useMemo(() => {
    return (subscriptionsData as Subscription[]).filter(sub => sub.clubId === club.id);
  }, [club.id]);

  const clubReviews = useMemo(() => {
    return (reviewsData as Review[]).filter(review => review.clubId === club.id);
  }, [club.id]);

  const approvedReviews = useMemo(() => {
    return clubReviews.filter(review => review.status === 'approved');
  }, [clubReviews]);

  const totalRevenue = useMemo(() => {
    // Simular facturación basada en suscripciones activas (precio fijo por suscripción mensual)
    const activeSubs = clubSubscriptions.filter(sub => sub.status === 'active');
    const avgPricePerSub = 25000; // Precio promedio simulado por suscripción mensual
    return activeSubs.length * avgPricePerSub;
  }, [clubSubscriptions]);

  const monthlyGrowth = useMemo(() => {
    // Simular crecimiento mensual (puedes calcular de datos reales más adelante)
    return Math.round(Math.random() * 15 + 5); // Entre 5% y 20%
  }, []);

  const analytics = useMemo(() => {
    return (analyticsData as any)[club.id] || {
      views: Math.round(Math.random() * 20000 + 5000),
      likes: Math.round(Math.random() * 1000 + 200),
      favorites: Math.round(Math.random() * 500 + 100),
      monthlyExpenses: [
        { month: '2024-01', amount: 150000 + Math.random() * 50000 },
        { month: '2024-02', amount: 180000 + Math.random() * 50000 },
        { month: '2024-03', amount: 200000 + Math.random() * 50000 },
        { month: '2024-04', amount: 170000 + Math.random() * 50000 },
        { month: '2024-05', amount: 190000 + Math.random() * 50000 },
        { month: '2024-06', amount: 210000 + Math.random() * 50000 }
      ],
      trends: {
        positiveWords: ['excelente', 'recomendable', 'sorprendente', 'calidad', 'genial'],
        negativeWords: ['tarde', 'roto', 'decepcionante', 'malo'],
        ratingTrend: [4.2, 4.5, 4.7, 4.6, 4.8, 4.9]
      }
    };
  }, [club.id]);

  // Función corregida: sin espacios, con tipo explícito y tipado de usersData
  const getUserName: (userId: string) => string = (userId: string) => {
    const foundUser  = (usersData as User[]).find(u => u.id === userId);
    return foundUser  ? `${foundUser .firstName} ${foundUser .lastName}` : 'Usuario Desconocido';
  };

  const renderStatsSection = () => (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Tarjetas de métricas clave */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Suscriptores Activos</p>
              <p className="text-3xl font-bold">{club.totalSubscribers}</p>
            </div>
            <svg className="w-12 h-12 opacity-75" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
            </svg>
          </div>
          <p className="text-blue-100 text-sm mt-2">+{monthlyGrowth}% vs. mes anterior</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Facturación Mensual</p>
              <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
            </div>
            <svg className="w-12 h-12 opacity-75" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd"></path>
            </svg>
          </div>
          <p className="text-green-100 text-sm mt-2">Estimado para este mes</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Reseñas Promedio</p>
              <p className="text-3xl font-bold">{club.rating.toFixed(1)} ★</p>
            </div>
            <svg className="w-12 h-12 opacity-75" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
          </div>
          <p className="text-purple-100 text-sm mt-2">{approvedReviews.length} reseñas totales</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Envíos del Mes</p>
              <p className="text-3xl font-bold">{club.monthlyBoxesSent}</p>
            </div>
            <svg className="w-12 h-12 opacity-75" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-2 2a1 1 0 01-1.414 0l-2-2a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </div>
          <p className="text-yellow-100 text-sm mt-2">Cajas entregadas</p>
        </div>
      </div>

      {/* Gráficos Simples */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tendencia de Suscriptores</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Gráfico de línea: Suscriptores mensuales (implementar con Chart.js o similar)</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Gastos Mensuales</h3>
          <div className="space-y-2">
            {analytics.monthlyExpenses.slice(-6).map((exp: MonthlyExpense) => (
              <div key={exp.month} className="flex justify-between text-sm">
                <span>{exp.month}</span>
                <span className="font-semibold">-${exp.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Interacciones Digitales</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{analytics.views.toLocaleString()}</p>
            <p className="text-gray-600">Visualizaciones</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{analytics.likes}</p>
            <p className="text-gray-600">Me Gusta</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{analytics.favorites}</p>
            <p className="text-gray-600">Favoritos</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSalesSection = () => (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-semibold text-gray-800">Reportes de Ventas</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Exportar CSV
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <select className="p-2 border border-gray-300 rounded-md">
          <option>Todos los Meses</option>
          <option>Enero 2024</option>
          <option>Febrero 2024</option>
          <option>Marzo 2024</option>
          <option>Abril 2024</option>
          <option>Mayo 2024</option>
          <option>Junio 2024</option>
        </select>
        <select className="p-2 border border-gray-300 rounded-md">
          <option>Todos los Planes</option>
          <option>Plan Clásico</option>
          <option>Plan Premium</option>
          <option>Edición Limitada</option>
        </select>
        <input type="date" className="p-2 border border-gray-300 rounded-md" />
        <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">Filtrar</button>
      </div>

      {/* Tabla de Ventas */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Suscripción ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            </tr>
          </thead>
          <tbody>
            {clubSubscriptions.slice(0, 10).map(sub => {
              const clientUser  = (usersData as User[]).find(u => u.id === sub.userId);
              return (
                <tr key={sub.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(sub.startDate).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {clientUser  ? `${clientUser .firstName} ${clientUser .lastName}` : 'Cliente Anónimo'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.planId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${Math.round(Math.random() * 30000 + 20000).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      sub.status === 'active' ? 'bg-green-100 text-green-800' :
                      sub.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {clubSubscriptions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No hay ventas para mostrar</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

            {/* Resumen de Ventas */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-gray-900">{clubSubscriptions.length}</p>
          <p className="text-gray-600">Total Ventas</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
          <p className="text-gray-600">Ingresos Totales</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-gray-900">{clubSubscriptions.filter(s => s.status === 'active').length}</p>
          <p className="text-gray-600">Activas</p>
        </div>
      </div>
    </div>
  );

  const renderFeedbackSection = () => (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Análisis de Reseñas</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rating Promedio:</span>
              <span className="text-2xl font-bold text-yellow-600">{club.rating.toFixed(1)} ★</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Reseñas Totales:</span>
              <span className="text-2xl font-bold text-gray-900">{clubReviews.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Aprobadas:</span>
              <span className="text-2xl font-bold text-green-600">{approvedReviews.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pendientes/Bloqueadas:</span>
              <span className="text-2xl font-bold text-red-600">{clubReviews.length - approvedReviews.length}</span>
            </div>
          </div>

          {/* Distribución de Ratings */}
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-700 mb-3">Distribución de Ratings</h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = clubReviews.filter(r => r.rating === rating).length;
                return (
                  <div key={rating} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{rating} ★</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${clubReviews.length > 0 ? (count / clubReviews.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tendencias de Feedback</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-2">Palabras Positivas Comunes</h4>
              <div className="flex flex-wrap gap-2">
                {analytics.trends.positiveWords.map((word: string) => (
                  <span key={word} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {word}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-2">Palabras Negativas Comunes</h4>
              <div className="flex flex-wrap gap-2">
                {analytics.trends.negativeWords.map((word: string) => (
                  <span key={word} className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                    {word}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-2">Tendencia de Ratings Mensual</h4>
              <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Gráfico de tendencia: {analytics.trends.ratingTrend.join(' → ')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Reseñas Recientes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
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
              {clubReviews.slice(0, 5).map(review => (
                <tr key={review.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getUserName(review.userId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="text-yellow-500">{review.rating} ★</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={review.comment}>
                    {review.comment}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(review.date).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      review.status === 'approved' ? 'bg-green-100 text-green-800' :
                      review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {review.status}
                    </span>
                  </td>
                </tr>
              ))}
              {clubReviews.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No hay reseñas para mostrar</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sugerencias Automáticas */}
      <div className="mt-8 bg-blue-50 p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Sugerencias Basadas en Feedback</h3>
        <ul className="space-y-2 text-blue-700">
          <li className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Mejora en tiempos de entrega: {analytics.trends.negativeWords.includes('tarde') ? 'Detectado en 3 reseñas' : 'Sin incidencias'}</span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Calidad de productos: {analytics.trends.positiveWords.includes('calidad') ? 'Punto fuerte (mencionado 5 veces)' : 'Área de mejora'}</span>
          </li>
          <li className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Rating en ascenso: +0.7 en los últimos 6 meses. ¡Sigue así!</span>
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div>
      {activeSection === 'stats' && renderStatsSection()}
      {activeSection === 'sales' && renderSalesSection()}
      {activeSection === 'feedback' && renderFeedbackSection()}
    </div>
  );
};

export default AdminToolsContent;
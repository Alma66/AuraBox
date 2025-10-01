// FileName: src/pages/entrepreneur/ClubStatsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../../App';
import { User } from '../../../../types/user';
import { Club } from '../../../../types/club';
import { Subscription } from '../../../../types/subscription';
import AdminToolsSidebar from '../../../../components/entrepreneur/AdminToolsSidebar'; // Reutilizado/adaptado (ver abajo)
import StatsCards from '../../../../components/entrepreneur/StatsCards'; // Nuevo componente extraído
import TrendsChart from '../../../../components/entrepreneur/TrendsChart'; // Nuevo para gráficos simulados
import InteractionsSummary from '../../../../components/entrepreneur/InteractionsSummary'; // Nuevo para interacciones digitales

// Importar datos simulados
import clubsData from '../../../../data/clubs.json';
import subscriptionsData from '../../../../data/subscriptions.json';
import analyticsData from '../../../../data/analytics.json'; // Asumiendo que existe o simular

const ClubStatsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, isAuthenticated, userRole } = useAuth();
  const [managedClub, setManagedClub] = useState<Club | null>(null);
  const [clubSubscriptions, setClubSubscriptions] = useState<Subscription[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (userRole !== 'entrepreneur' || !user?.managedClubId) {
      window.location.href = '/';
      return;
    }

    const club = (clubsData as Club[]).find(c => c.id === user.managedClubId);
    if (club && club.id === clubId) {
      setManagedClub(club);
      setClubSubscriptions((subscriptionsData as Subscription[]).filter(sub => sub.clubId === club.id));
      // Simular analytics (fácil de cambiar a API)
      setAnalytics((analyticsData as any)[club.id] || {
        views: Math.round(Math.random() * 20000 + 5000),
        likes: Math.round(Math.random() * 1000 + 200),
        favorites: Math.round(Math.random() * 500 + 100),
        monthlyExpenses: [
          { month: '2024-01', amount: 150000 + Math.random() * 50000 },
          { month: '2024-02', amount: 180000 + Math.random() * 50000 },
          // ... más meses
        ],
        trends: { ratingTrend: [4.2, 4.5, 4.7, 4.6, 4.8, 4.9] }
      });
    } else {
      window.location.href = '/';
    }
  }, [clubId, userRole, user]);

  if (!managedClub || !analytics) {
    return <div className="text-center py-20">Cargando estadísticas...</div>;
  }

  // Calcular métricas dinámicas (fácil integración backend)
  const totalRevenue = clubSubscriptions.filter(sub => sub.status === 'active').length * 25000; // Simulado
  const monthlyGrowth = Math.round(Math.random() * 15 + 5); // Simulado

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      {/* Header/Breadcrumbs */}
      <div className="mb-8">
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a href="/entrepreneur/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                Dashboard Emprendedor
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <a href={`/entrepreneur/club/${clubId}`} className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">{managedClub.name}</a>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Estadísticas</span>
              </div>
            </li>
          </ol>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900">Estadísticas del Club - {managedClub.name}</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar (opcional, reutilizado de tu ejemplo; colapsa en mobile) */}
        <div className="lg:w-1/4 hidden lg:block">
          <AdminToolsSidebar activeSection="stats" setActiveSection={() => {}} clubId={clubId!} /> {/* ← CORREGIDO: clubId! */}
        </div>

        {/* Contenido Principal */}
        <div className="lg:w-3/4 space-y-8">
          {/* Tarjetas de KPIs */}
          <StatsCards 
            subscribers={managedClub.totalSubscribers} 
            revenue={totalRevenue} 
            rating={managedClub.rating} 
            boxesSent={managedClub.monthlyBoxesSent}
            growth={monthlyGrowth}
          />

          {/* Gráficos de Tendencias */}
          <TrendsChart trends={analytics.trends} monthlyExpenses={analytics.monthlyExpenses} />

          {/* Resumen de Interacciones */}
          <InteractionsSummary analytics={analytics} />

          {/* Sección de Recomendaciones (agregado para completitud) */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recomendaciones Basadas en Datos</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Tu club muestra un crecimiento del {monthlyGrowth}% en suscriptores. Considera campañas de retención para mantener el momentum.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Rating alto ({managedClub.rating.toFixed(1)}). Destaca reseñas positivas en redes para atraer más tráfico.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-yellow-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span>Gastos mensuales estables. Monitorea picos en {analytics.monthlyExpenses[analytics.monthlyExpenses.length - 1].month} para optimizar costos.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubStatsPage;
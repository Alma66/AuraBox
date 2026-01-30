import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../../App';
import { User } from '../../../../types/user';
import { Club } from '../../../../types/club';
import { Subscription } from '../../../../types/subscription';
import AdminToolsSidebar from '../../../../components/entrepreneur/AdminToolsSidebar';
import SalesTable from '../../../../components/entrepreneur/SalesTable';
import SalesFilters from '../../../../components/entrepreneur/SalesFilters';
import SalesSummary from '../../../../components/entrepreneur/SalesSummary';
import SalesChart from '../../../../components/entrepreneur/SalesChart';
import clubsData from '../../../../data/clubs.json';
import subscriptionsData from '../../../../data/subscriptions.json';
import usersData from '../../../../data/user.json';

const SalesReportsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, userRole } = useAuth();
  const [managedClub, setManagedClub] = useState<Club | null>(null);
  const [clubSubscriptions, setClubSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [filters, setFilters] = useState({ month: 'all', plan: 'all', status: 'all' });

  useEffect(() => {
    if (userRole !== 'entrepreneur' || !user?.managedClubId) {
      window.location.href = '/';
      return;
    }

    const club = (clubsData as Club[]).find(c => c.id === user.managedClubId);
    if (club && club.id === clubId) {
      setManagedClub(club);
      const subs = (subscriptionsData as Subscription[]).filter(sub => sub.clubId === club.id);
      setClubSubscriptions(subs);
      setFilteredSubscriptions(subs);
    } else {
      window.location.href = '/';
    }
  }, [clubId, userRole, user]);

  useMemo(() => {
    let filtered = clubSubscriptions;
    if (filters.month !== 'all') {
      filtered = filtered.filter(sub => {
        const subMonth = new Date(sub.startDate).getMonth() + 1;
        return subMonth === parseInt(filters.month);
      });
    }
    if (filters.plan !== 'all') {
      filtered = filtered.filter(sub => sub.planId === filters.plan);
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter(sub => sub.status === filters.status);
    }
    setFilteredSubscriptions(filtered);
  }, [clubSubscriptions, filters]);

  const totalRevenue = useMemo(() => {
    return filteredSubscriptions.reduce((sum, sub) => {
      return sum + (sub.status === 'active' ? 25000 : 0);
    }, 0);
  }, [filteredSubscriptions]);

  const activeCount = useMemo(() => filteredSubscriptions.filter(sub => sub.status === 'active').length, [filteredSubscriptions]);

  if (!managedClub) {
    return <div className="text-center py-20">Cargando reportes de ventas...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gray-50">
      <div className="mb-8">
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/entrepreneur/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                Dashboard Emprendedor
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <Link to={`/entrepreneur/club/${clubId}`} className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
                  {managedClub.name}
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Reportes de Ventas</span>
              </div>
            </li>
          </ol>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900">Reportes de Ventas - {managedClub.name}</h1>
        <p className="text-gray-600 mt-2">Visualiza y filtra tus ventas mensuales. Exporta datos para análisis externo.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4 hidden lg:block">
         <AdminToolsSidebar activeSection="sales" setActiveSection={() => {}} clubId={clubId!} />
        </div>

        <div className="lg:w-3/4 space-y-8">
          <SalesFilters filters={filters} setFilters={setFilters} />

          <SalesSummary totalRevenue={totalRevenue} activeCount={activeCount} totalSales={filteredSubscriptions.length} />

          <SalesChart subscriptions={filteredSubscriptions} />

          <SalesTable subscriptions={filteredSubscriptions} usersData={usersData as User[]} />

          <div className="text-center">
            <button 
              onClick={() => alert('Exportando CSV... (Implementar con backend)')} 
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg transition-colors"
            >
              Exportar Reporte Completo (CSV)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReportsPage;
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../App';
import { User } from '../../../../types/user';
import { Club } from '../../../../types/club';
import { Subscription, normalizeStatus } from '../../../../types/subscription';
import AdminToolsSidebar from '../../../../components/entrepreneur/AdminToolsSidebar';
import SalesTable from '../../../../components/entrepreneur/SalesTable';
import SalesFilters from '../../../../components/entrepreneur/SalesFilters';
import SalesSummary from '../../../../components/entrepreneur/SalesSummary';
import SalesChart from '../../../../components/entrepreneur/SalesChart';
import api, { getResponseData } from '../../../../api/config';

const SalesReportsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [managedClub, setManagedClub] = useState<Club | null>(null);
  const [clubSubscriptions, setClubSubscriptions] = useState<Subscription[]>([]);
  const [usersData, setUsersData] = useState<User[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [filters, setFilters] = useState({ month: 'all', plan: 'all', status: 'all' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (userRole !== 'entrepreneur' || !user?.managedClubId) {
        navigate('/');
        return;
      }

      const clubIdToUse = clubId || user.managedClubId;

      try {
        const [clubResponse, subsResponse, customersResponse] = await Promise.all([
          api.get(`/clubs/${clubIdToUse}`),
          api.get(`/clubs/${clubIdToUse}/user-subscriptions`),
          api.get(`/clubs/${clubIdToUse}/customers`),
        ]);

        const clubData = getResponseData(clubResponse);

        if (String(clubData.id) !== String(clubIdToUse)) {
          navigate('/');
          return;
        }

        setManagedClub(clubData);
        const subs: Subscription[] = getResponseData(subsResponse) || [];
        setClubSubscriptions(subs);
        setFilteredSubscriptions(subs);
        setUsersData(getResponseData(customersResponse) || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clubId, userRole, user, navigate]);

  useEffect(() => {
    let filtered = [...clubSubscriptions];
    if (filters.month !== 'all') {
      filtered = filtered.filter(sub => {
        const subMonth = new Date(sub.startDate).getMonth() + 1;
        return subMonth === parseInt(filters.month);
      });
    }
    if (filters.plan !== 'all') {
      filtered = filtered.filter(sub => sub.idSubscriptionTypes === Number(filters.plan));
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter(sub => normalizeStatus(sub.subscriptionStatus) === filters.status);
    }
    setFilteredSubscriptions(filtered);
  }, [clubSubscriptions, filters]);

  const totalRevenue = useMemo(() => {
    return filteredSubscriptions.reduce((sum, sub) => {
      const plan = managedClub?.subscriptionPlans?.find(p => Number(p.planId) === sub.idSubscriptionTypes);
      const amount = sub.monthlyAmountPaid ? Number(sub.monthlyAmountPaid) : plan?.price ?? 0;
      return sum + (normalizeStatus(sub.subscriptionStatus) === 'active' ? amount : 0);
    }, 0);
  }, [filteredSubscriptions, managedClub]);

  const activeCount = useMemo(
    () => filteredSubscriptions.filter(sub => normalizeStatus(sub.subscriptionStatus) === 'active').length,
    [filteredSubscriptions],
  );

  if (loading) {
    return <div className="text-center py-20">Cargando reportes de ventas...</div>;
  }

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
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link to={`/entrepreneur/club/${clubId}`} className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
                  {managedClub.name}
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
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

          <SalesTable subscriptions={filteredSubscriptions} usersData={usersData} />

          <div className="text-center">
            <button
              onClick={() => alert('Exportando CSV...')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg transition-colors"
            >
              Exportar Reporte Completo (CSV)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};3
export default SalesReportsPage;
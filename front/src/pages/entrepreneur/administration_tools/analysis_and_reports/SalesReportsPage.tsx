import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../../App';
import api, { getResponseData } from '../../../../api/config';
import SalesReportsSidebar from '../../../../components/entrepreneur/SalesReportsSidebar';
import SalesReportsContent from '../../../../components/entrepreneur/SalesReportsContent';
import { SalesReportData } from '../../../../types/analystics';
import { Club } from '../../../../types/club';
import toast from 'react-hot-toast';

type SalesSection = 'resumen' | 'graficos' | 'pagos' | 'metodos' | 'proyecciones';

const PAGE_SIZE = 20;

const SalesReportsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SalesSection>('resumen');
  const [club, setClub] = useState<Club | null>(null);
  const [data, setData] = useState<SalesReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: '', to: '', paymentStatus: '' });
  const [page, setPage] = useState(1);

  const managedClubId = clubId || user?.managedClubId;

  const fetchData = useCallback(async () => {
    if (!managedClubId) return;
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), pageSize: String(PAGE_SIZE) };
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
      const [clubRes, salesRes] = await Promise.all([
        api.get(`/clubs/${managedClubId}`),
        api.get(`/analytics/sales-report/${managedClubId}`, { params }),
      ]);
      setClub(getResponseData(clubRes));
      setData(getResponseData(salesRes));
    } catch {
      navigate('/entrepreneur/profile');
    } finally {
      setLoading(false);
    }
  }, [managedClubId, filters, page, navigate]);

  useEffect(() => {
    if (authLoading) return;
    if (!managedClubId || userRole !== 'entrepreneur') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [authLoading, managedClubId, userRole, navigate, fetchData]);

  const handleFilterChange = (k: string, v: string) => {
    setFilters((prev) => ({ ...prev, [k]: v }));
    setPage(1);
  };

  const handleExportCsv = async () => {
    if (!managedClubId) return;
    try {
      const params: Record<string, string> = {};
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
      const res = await api.get(`/analytics/sales-report-export/${managedClubId}`, { params });
      const rows: Record<string, unknown>[] = getResponseData(res) || [];
      if (rows.length === 0) return;
      const headers = Object.keys(rows[0]).join(',');
      const body = rows
        .map((r) => Object.values(r).map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const csv = `${headers}\n${body}`;
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-ventas-${managedClubId}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Error al exportar el CSV');
    }
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-aurora-cream">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-aurora-navy/15 border-t-aurora-terracotta" />
    </div>
  );

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center text-aurora-navy/50 bg-aurora-cream">No se pudieron cargar los reportes.</div>;
  }

  return (
    <div className="min-h-screen bg-aurora-cream">
      <div className="bg-white border-b border-aurora-navy/10">
        <div className="container mx-auto px-4 py-5">
          <nav className="text-xs text-aurora-navy/50 mb-1 flex items-center gap-1">
            <Link to="/entrepreneur/profile" className="hover:text-aurora-terracotta">Mi Club</Link>
            <span>›</span>
            <Link to={`/entrepreneur/club/${managedClubId}`} className="hover:text-aurora-terracotta">{club?.name || 'Club'}</Link>
            <span>›</span>
            <span className="text-aurora-navy/70">Reportes de ventas</span>
          </nav>
          <h1 className="font-display text-2xl font-bold text-aurora-navy">Reportes de Ventas</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/5">
            <SalesReportsSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          </div>
          <div className="lg:w-4/5 bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-6">
            <SalesReportsContent
              activeSection={activeSection}
              data={data}
              filters={filters}
              onFilterChange={handleFilterChange}
              onExportCsv={handleExportCsv}
              page={page}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReportsPage;
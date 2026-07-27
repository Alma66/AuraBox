import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../App';
import api, { getResponseData } from '../../../../api/config';
import SalesReportsSidebar from '../../../../components/entrepreneur/SalesReportsSidebar';
import SalesReportsContent from '../../../../components/entrepreneur/SalesReportsContent';
import { SalesReportData } from '../../../../types/analystics';

type SalesSection = 'resumen' | 'graficos' | 'pagos' | 'metodos' | 'proyecciones';

const PAGE_SIZE = 20;

const SalesReportsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SalesSection>('resumen');
  const [data, setData] = useState<SalesReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: '', to: '', paymentStatus: '' });
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), pageSize: String(PAGE_SIZE) };
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
      const res = await api.get(`/analytics/sales-report/${clubId}`, { params });
      setData(getResponseData(res));
    } catch {
      navigate('/entrepreneur/profile');
    } finally {
      setLoading(false);
    }
  }, [clubId, filters, page, navigate]);

  useEffect(() => {
    if (authLoading) return;
    if (!clubId || userRole !== 'entrepreneur') {
      navigate('/login');
      return;
    }
    fetchData();
  }, [authLoading, clubId, userRole, navigate, fetchData]);

  const handleFilterChange = (k: string, v: string) => {
    setFilters((prev) => ({ ...prev, [k]: v }));
    setPage(1);
  };

  const handleExportCsv = async () => {
    if (!clubId) return;
    try {
      const params: Record<string, string> = {};
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
      const res = await api.get(`/analytics/sales-report-export/${clubId}`, { params });
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
      a.download = `reporte-ventas-${clubId}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Error al exportar el CSV');
    }
  };

  if (authLoading || loading) {
    return <div className="text-center py-20 text-gray-500">Cargando reportes de ventas...</div>;
  }

  if (!data) {
    return <div className="text-center py-20 text-gray-500">No se pudieron cargar los reportes.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Reportes de Ventas</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/5">
          <SalesReportsSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        </div>
        <div className="lg:w-4/5 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
  );
};

export default SalesReportsPage;
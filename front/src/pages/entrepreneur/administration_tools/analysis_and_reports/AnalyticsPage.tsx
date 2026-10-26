import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../../../api/config';
import SectionedContentPage, { GroupDef } from '../../../../components/entrepreneur/layout/SectionedContentPage';
import ClubStatsContent from '../../../../components/entrepreneur/ClubStatsContent';
import SalesReportsContent from '../../../../components/entrepreneur/SalesReportsContent';
import FeedbackTrendsContent from '../../../../components/entrepreneur/FeedbackTrendsContent';
import { ClubStatsData, FeedbackTrendsData, SalesReportData } from '../../../../types/analystics';

const PAGE_SIZE = 20;

function useApiData<T>(url: string, params?: Record<string, string>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const key = JSON.stringify(params ?? {});

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await api.get(url, { params: JSON.parse(key) });
      setData(getResponseData(res));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [url, key]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}

interface AsyncBlockProps {
  loading: boolean;
  error: boolean;
  hasData: boolean;
  onRetry: () => void;
  children: React.ReactNode;
}

const AsyncBlock: React.FC<AsyncBlockProps> = ({ loading, error, hasData, onRetry, children }) => {
  if (!hasData && loading) {
    return (
      <div className="animate-pulse space-y-4" aria-busy="true">
        <div className="h-8 w-56 rounded bg-aurora-navy/10" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-24 rounded-xl bg-aurora-navy/10" />
          ))}
        </div>
        <div className="h-56 rounded-xl bg-aurora-navy/10" />
      </div>
    );
  }
  if (!hasData && error) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        <p>No se pudieron cargar los datos.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 min-h-[44px] rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }
  return <div className={loading ? 'opacity-60 transition-opacity' : ''}>{children}</div>;
};

const StatsPanel: React.FC<{ section: string; clubId: string }> = ({ section, clubId }) => {
  const { data, loading, error, reload } = useApiData<ClubStatsData>(`/analytics/club-stats/${clubId}`);
  return (
    <AsyncBlock loading={loading} error={error} hasData={!!data} onRetry={reload}>
      {data && <ClubStatsContent activeSection={section} data={data} clubId={clubId} />}
    </AsyncBlock>
  );
};

const FeedbackPanel: React.FC<{ section: string; clubId: string }> = ({ section, clubId }) => {
  const { data, loading, error, reload } = useApiData<FeedbackTrendsData>(`/analytics/feedback-trends/${clubId}`);
  return (
    <AsyncBlock loading={loading} error={error} hasData={!!data} onRetry={reload}>
      {data && <FeedbackTrendsContent activeSection={section} data={data} clubId={clubId} />}
    </AsyncBlock>
  );
};

const SalesPanel: React.FC<{ section: string; clubId: string }> = ({ section, clubId }) => {
  const [filters, setFilters] = useState({ from: '', to: '', paymentStatus: '' });
  const [page, setPage] = useState(1);

  const buildParams = useCallback(() => {
    const params: Record<string, string> = {};
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
    return params;
  }, [filters]);

  const { data, loading, error, reload } = useApiData<SalesReportData>(`/analytics/sales-report/${clubId}`, {
    ...buildParams(),
    page: String(page),
    pageSize: String(PAGE_SIZE),
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleExportCsv = async () => {
    try {
      const res = await api.get(`/analytics/sales-report-export/${clubId}`, { params: buildParams() });
      const rows: Record<string, unknown>[] = getResponseData(res) || [];
      if (rows.length === 0) {
        toast('No hay pagos para exportar con estos filtros.');
        return;
      }
      const headers = Object.keys(rows[0]).join(',');
      const body = rows
        .map((r) => Object.values(r).map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const blob = new Blob(['\uFEFF' + `${headers}\n${body}`], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-ventas-${clubId}-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Error al exportar el CSV');
    }
  };

  return (
    <AsyncBlock loading={loading} error={error} hasData={!!data} onRetry={reload}>
      {data && (
        <SalesReportsContent
          activeSection={section}
          data={data}
          filters={filters}
          onFilterChange={handleFilterChange}
          onExportCsv={handleExportCsv}
          page={page}
          onPageChange={setPage}
        />
      )}
    </AsyncBlock>
  );
};

const GROUPS: GroupDef[] = [
  {
    id: 'stats',
    label: 'Estadísticas',
    sections: [
      { id: 'resumen', label: 'Resumen' },
      { id: 'evolucion', label: 'Evolución' },
      { id: 'logistica', label: 'Logística' },
      { id: 'reputacion', label: 'Reputación' },
      { id: 'planes', label: 'Planes' },
    ],
    render: (section, club) => <StatsPanel section={section} clubId={String(club.id)} />,
  },
  {
    id: 'sales',
    label: 'Ventas',
    sections: [
      { id: 'resumen', label: 'Resumen' },
      { id: 'graficos', label: 'Gráficos' },
      { id: 'pagos', label: 'Pagos' },
      { id: 'metodos', label: 'Métodos de pago' },
      { id: 'proyecciones', label: 'Proyecciones' },
    ],
    render: (section, club) => <SalesPanel section={section} clubId={String(club.id)} />,
  },
  {
    id: 'feedback',
    label: 'Feedback',
    sections: [
      { id: 'rating', label: 'Rating' },
      { id: 'altas-bajas', label: 'Altas y bajas' },
      { id: 'destacadas', label: 'Destacadas' },
      { id: 'palabras', label: 'Palabras' },
      { id: 'media', label: 'Multimedia' },
    ],
    render: (section, club) => <FeedbackPanel section={section} clubId={String(club.id)} />,
  },
];

const AnalyticsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  if (!clubId) return null;
  return <SectionedContentPage clubId={clubId} groups={GROUPS} />;
};

export default AnalyticsPage;
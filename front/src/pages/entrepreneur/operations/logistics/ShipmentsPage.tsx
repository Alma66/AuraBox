import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import api, { getResponseData } from '../../../../api/config';
import PendingAssignments from '../../../../components/entrepreneur/logistics/PendingAssignments';
import RidersDrawer from '../../../../components/entrepreneur/logistics/RidersDrawer';
import ShipmentsListView from '../../../../components/entrepreneur/customerLogistics/ShipmentsListView';
import Icon from '../../../../components/entrepreneur/layout/Icon';

type MainTab = 'assign' | 'list';
type ListView = 'recent' | 'history';

const ShipmentsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [clubName, setClubName] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [ridersOpen, setRidersOpen] = useState(searchParams.get('riders') === '1');

  const tab: MainTab = searchParams.get('tab') === 'list' ? 'list' : 'assign';
  const view: ListView = searchParams.get('view') === 'history' ? 'history' : 'recent';

  useEffect(() => {
    if (!clubId) return;
    let cancelled = false;
    api
      .get(`/clubs/${clubId}`)
      .then((res: any) => {
        if (!cancelled) setClubName(getResponseData(res)?.name ?? '');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [clubId]);

  const setParams = (next: Record<string, string>) => {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => params.set(key, value));
    setSearchParams(params, { replace: true });
  };

  const selectTab = (next: MainTab) => setParams(next === 'list' ? { tab: 'list', view } : { tab: 'assign' });
  const selectView = (next: ListView) => setParams({ tab: 'list', view: next });

  const openRiders = useCallback(() => setRidersOpen(true), []);
  const closeRiders = useCallback(() => setRidersOpen(false), []);
  const handleChanged = useCallback(() => setRefreshKey((current) => current + 1), []);

  if (!clubId) return null;

  const tabClass = (isActive: boolean) =>
    `flex min-h-[44px] items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${
      isActive ? 'bg-aurora-navy text-white' : 'text-aurora-navy/70 hover:bg-white'
    }`;

  const viewClass = (isActive: boolean) =>
    `min-h-[40px] rounded-full px-4 text-xs font-semibold transition-colors ${
      isActive ? 'bg-aurora-terracotta text-white' : 'bg-white text-aurora-navy/70 hover:text-aurora-navy'
    }`;

  return (
    <div className="space-y-5 px-4 py-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Vistas de envíos" className="flex gap-1 rounded-xl bg-aurora-navy/5 p-1">
          <button type="button" role="tab" aria-selected={tab === 'assign'} onClick={() => selectTab('assign')} className={tabClass(tab === 'assign')}>
            Por asignar
            {pendingCount > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-xs ${tab === 'assign' ? 'bg-aurora-gold text-aurora-navy' : 'bg-aurora-terracotta text-white'}`}>
                {pendingCount}
              </span>
            )}
          </button>
          <button type="button" role="tab" aria-selected={tab === 'list'} onClick={() => selectTab('list')} className={tabClass(tab === 'list')}>
            Envíos
          </button>
        </div>
        <button
          type="button"
          onClick={openRiders}
          className="flex min-h-[44px] items-center gap-2 rounded-xl border border-aurora-navy/15 bg-white px-4 text-sm font-semibold text-aurora-navy transition-colors hover:border-aurora-navy/30"
        >
          <Icon name="users" className="h-4 w-4" />
          Riders y empresas
        </button>
      </div>

      <div className={tab === 'assign' ? '' : 'hidden'}>
        <PendingAssignments
          clubId={clubId}
          refreshKey={refreshKey}
          onCountChange={setPendingCount}
          onOpenRiders={openRiders}
        />
      </div>

      {tab === 'list' && (
        <div>
          <div className="mb-4 flex gap-2" role="group" aria-label="Rango de envíos">
            <button type="button" onClick={() => selectView('recent')} aria-pressed={view === 'recent'} className={viewClass(view === 'recent')}>
              Últimos 7 días
            </button>
            <button type="button" onClick={() => selectView('history')} aria-pressed={view === 'history'} className={viewClass(view === 'history')}>
              Historial completo
            </button>
          </div>
          <ShipmentsListView
            key={view}
            clubId={clubId}
            clubName={clubName}
            title={view === 'recent' ? 'Envíos Recientes' : 'Historial de Entregas'}
            defaultRangeDays={view === 'recent' ? 7 : null}
          />
        </div>
      )}

      <RidersDrawer open={ridersOpen} onClose={closeRiders} clubId={clubId} onChanged={handleChanged} />
    </div>
  );
};

export default ShipmentsPage;
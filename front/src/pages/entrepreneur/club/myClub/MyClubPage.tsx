import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ClubDetailPage from './ClubDetailPage';
import HistoryPage from './HistoryPage';
import ClubMediaTab from '../../../../components/entrepreneur/club/ClubMediaTab';

type Tab = 'profile' | 'history' | 'media';

const TABS: { id: Tab; label: string }[] = [
  { id: 'profile', label: 'Perfil' },
  { id: 'history', label: 'Historia' },
  { id: 'media', label: 'Multimedia' },
];

const MyClubPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get('tab');
  const tab: Tab = requested === 'history' || requested === 'media' ? requested : 'profile';

  if (!clubId) return null;

  return (
    <div>
      <div className="px-4 pt-6 lg:px-8">
        <div role="tablist" aria-label="Secciones de Mi club" className="inline-flex gap-1 rounded-xl bg-aurora-navy/5 p-1">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setSearchParams({ tab: item.id }, { replace: true })}
              className={`min-h-[44px] rounded-lg px-4 text-sm font-semibold transition-colors ${
                tab === item.id ? 'bg-aurora-navy text-white' : 'text-aurora-navy/70 hover:bg-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {tab === 'profile' && <ClubDetailPage />}
      {tab === 'history' && <HistoryPage />}
      {tab === 'media' && <ClubMediaTab clubId={clubId} />}
    </div>
  );
};

export default MyClubPage;
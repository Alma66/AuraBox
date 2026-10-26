import React from 'react';
import { useSearchParams } from 'react-router-dom';

export interface SimpleTab {
  id: string;
  label: string;
  element: React.ReactNode;
}

interface SimpleTabsPageProps {
  label: string;
  tabs: SimpleTab[];
}

const SimpleTabsPage: React.FC<SimpleTabsPageProps> = ({ label, tabs }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const active = tabs.find((tab) => tab.id === searchParams.get('tab')) ?? tabs[0];

  return (
    <div>
      <div className="px-4 pt-6 lg:px-8">
        <div
          role="tablist"
          aria-label={label}
          className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl bg-aurora-navy/5 p-1"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tab.id === active.id}
              onClick={() => setSearchParams({ tab: tab.id }, { replace: true })}
              className={`min-h-[44px] whitespace-nowrap rounded-lg px-4 text-sm font-semibold transition-colors ${
                tab.id === active.id ? 'bg-aurora-navy text-white' : 'text-aurora-navy/70 hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {active.element}
    </div>
  );
};

export default SimpleTabsPage;
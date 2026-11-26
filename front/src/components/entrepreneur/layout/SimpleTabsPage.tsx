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
          className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-white p-1.5 shadow-aurora-sm ring-1 ring-aurora-navy/5"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={tab.id === active.id}
              onClick={() => setSearchParams({ tab: tab.id }, { replace: true })}
              className={`min-h-[44px] whitespace-nowrap rounded-full px-5 text-sm font-semibold transition-colors ${
                tab.id === active.id ? 'bg-aurora-navy text-white' : 'text-aurora-navy/70 hover:bg-aurora-cream'
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
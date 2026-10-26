import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { getResponseData } from '../../../api/config';
import { Club } from '../../../types/club';

export interface SectionDef {
  id: string;
  label: string;
}

export interface GroupDef {
  id: string;
  label: string;
  badge?: number;
  sections: SectionDef[];
  render: (section: string, club: Club, go: (section: string) => void) => React.ReactNode;
}

interface SectionedContentPageProps {
  clubId: string;
  groups: GroupDef[];
}

const SectionedContentPage: React.FC<SectionedContentPageProps> = ({ clubId, groups }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [club, setClub] = useState<Club | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    api
      .get(`/clubs/${clubId}`)
      .then((res: any) => {
        if (!cancelled) setClub(getResponseData(res));
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [clubId]);

  const group = groups.find((item) => item.id === searchParams.get('group')) ?? groups[0];
  const section = group.sections.find((item) => item.id === searchParams.get('section')) ?? group.sections[0];

  const select = (groupId: string, sectionId?: string) => {
    const target = groups.find((item) => item.id === groupId) ?? groups[0];
    setSearchParams({ group: target.id, section: sectionId ?? target.sections[0].id }, { replace: true });
  };

  if (failed) {
    return (
      <div role="alert" className="m-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 lg:mx-8">
        No se pudo cargar el club.
      </div>
    );
  }

  if (!club) {
    return (
      <div className="animate-pulse space-y-4 px-4 py-6 lg:px-8" aria-busy="true">
        <div className="h-11 w-72 rounded-xl bg-aurora-navy/10" />
        <div className="h-64 rounded-2xl bg-aurora-navy/10" />
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4 py-6 lg:px-8">
      <div role="tablist" aria-label="Secciones" className="inline-flex gap-1 rounded-xl bg-aurora-navy/5 p-1">
        {groups.map((item) => {
          const isActive = item.id === group.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => select(item.id)}
              className={`flex min-h-[44px] items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${
                isActive ? 'bg-aurora-navy text-white' : 'text-aurora-navy/70 hover:bg-white'
              }`}
            >
              {item.label}
              {!!item.badge && item.badge > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-aurora-gold text-aurora-navy' : 'bg-aurora-terracotta text-white'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div role="group" aria-label={`Vistas de ${group.label}`} className="flex flex-wrap gap-2">
        {group.sections.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={item.id === section.id}
            onClick={() => select(group.id, item.id)}
            className={`min-h-[40px] rounded-full px-4 text-xs font-semibold transition-colors ${
              item.id === section.id ? 'bg-aurora-terracotta text-white' : 'bg-white text-aurora-navy/70 hover:text-aurora-navy'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-aurora-navy/10 bg-white p-4 shadow-aurora-sm sm:p-6">
        {group.render(section.id, club, (next) => select(group.id, next))}
      </div>
    </div>
  );
};

export default SectionedContentPage;
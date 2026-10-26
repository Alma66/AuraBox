import React, { useEffect, useState } from 'react';
import api, { getResponseData } from '../../../api/config';
import { Club } from '../../../types/club';
import ManageClubImagesContent from '../ManageClubImagesContent';

interface ClubMediaTabProps {
  clubId: string;
}

const SECTIONS = [
  { id: 'Logo', label: 'Logo' },
  { id: 'Banner', label: 'Banners' },
  { id: 'Historia', label: 'Historia' },
  { id: 'Equipo', label: 'Equipo' },
];

const ClubMediaTab: React.FC<ClubMediaTabProps> = ({ clubId }) => {
  const [club, setClub] = useState<Club | null>(null);
  const [failed, setFailed] = useState(false);
  const [section, setSection] = useState('Logo');

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

  if (failed) {
    return (
      <div role="alert" className="m-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 lg:mx-8">
        No se pudieron cargar las imágenes del club.
      </div>
    );
  }

  if (!club) {
    return (
      <div className="animate-pulse space-y-4 px-4 py-6 lg:px-8" aria-busy="true">
        <div className="h-11 w-80 rounded-xl bg-aurora-navy/10" />
        <div className="h-64 rounded-2xl bg-aurora-navy/10" />
      </div>
    );
  }

  return (
    <div className="space-y-5 px-4 py-6 lg:px-8">
      <div role="tablist" aria-label="Secciones de imágenes" className="flex flex-wrap gap-2">
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={section === item.id}
            onClick={() => setSection(item.id)}
            className={`min-h-[44px] rounded-full px-5 text-sm font-semibold transition-colors ${
              section === item.id ? 'bg-aurora-terracotta text-white' : 'bg-white text-aurora-navy/70 hover:text-aurora-navy'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-aurora-navy/10 bg-white p-4 shadow-aurora-sm sm:p-6">
        <ManageClubImagesContent activeSection={section} club={club} />
      </div>
    </div>
  );
};

export default ClubMediaTab;
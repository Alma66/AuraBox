import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { getResponseData } from '../../../api/config';
import SectionedContentPage, { GroupDef } from '../../../components/entrepreneur/layout/SectionedContentPage';
import CustomerSupportContent from '../../../components/entrepreneur/CustomerSupportContent';
import ModerateReviewsContent from '../../../components/entrepreneur/ModerateReviewsContent';
import { SupportConversation } from '../../../types/support';
import { Review } from '../../../types/review';

const CommunityPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [unreadCount, setUnreadCount] = useState(0);
  const [hiddenCount, setHiddenCount] = useState(0);

  useEffect(() => {
    if (!clubId) return;
    let cancelled = false;
    Promise.allSettled([
      api.get(`/support/conversations/by-club/${clubId}`, { params: { status: 'Abierta' } }),
      api.get(`/reviews/hidden-by-club/${clubId}`),
    ]).then(([convRes, hiddenRes]) => {
      if (cancelled) return;
      if (convRes.status === 'fulfilled') {
        const convs: SupportConversation[] = getResponseData(convRes.value) || [];
        setUnreadCount(convs.filter((c) => c.hasUnreadForEntrepreneur).length);
      }
      if (hiddenRes.status === 'fulfilled') {
        const hidden: Review[] = getResponseData(hiddenRes.value) || [];
        setHiddenCount(hidden.length);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [clubId]);

  const groups = useMemo<GroupDef[]>(
    () => [
      {
        id: 'support',
        label: 'Atención post-venta',
        badge: unreadCount,
        sections: [
          { id: 'abiertas', label: 'Abiertas' },
          { id: 'cerradas', label: 'Cerradas' },
          { id: 'automaticos', label: 'Mensajes automáticos' },
        ],
        render: (section, club) => <CustomerSupportContent activeSection={section} club={club} />,
      },
      {
        id: 'reviews',
        label: 'Reseñas',
        badge: hiddenCount,
        sections: [
          { id: 'visibles', label: 'Visibles' },
          { id: 'ocultas', label: 'Ocultas' },
          { id: 'palabras', label: 'Palabras filtro' },
        ],
        render: (section, club) => <ModerateReviewsContent activeSection={section} club={club} />,
      },
    ],
    [unreadCount, hiddenCount],
  );

  if (!clubId) return null;
  return <SectionedContentPage clubId={clubId} groups={groups} />;
};

export default CommunityPage;
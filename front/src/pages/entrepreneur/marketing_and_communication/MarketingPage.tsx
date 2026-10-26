import React from 'react';
import { useParams } from 'react-router-dom';
import SectionedContentPage, { GroupDef } from '../../../components/entrepreneur/layout/SectionedContentPage';
import ManagePromotionsContent from '../../../components/entrepreneur/ManagePromotionsContent';
import SendNewsletterContent from '../../../components/entrepreneur/SendNewsletterContent';

const GROUPS: GroupDef[] = [
  {
    id: 'promotions',
    label: 'Promociones',
    sections: [
      { id: 'activas', label: 'Activas' },
      { id: 'nueva', label: 'Nueva promoción' },
      { id: 'historial', label: 'Historial' },
    ],
    render: (section, club, go) => <ManagePromotionsContent activeSection={section} club={club} onNavigate={go} />,
  },
  {
    id: 'newsletters',
    label: 'Newsletters',
    sections: [
      { id: 'nuevo', label: 'Nuevo' },
      { id: 'borradores', label: 'Borradores' },
      { id: 'plantillas', label: 'Plantillas' },
      { id: 'historial', label: 'Historial y métricas' },
    ],
    render: (section, club) => <SendNewsletterContent activeSection={section} club={club} />,
  },
];

const MarketingPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  if (!clubId) return null;
  return <SectionedContentPage clubId={clubId} groups={GROUPS} />;
};

export default MarketingPage;
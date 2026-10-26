import React from 'react';
import SimpleTabsPage from '../../../components/entrepreneur/layout/SimpleTabsPage';
import SettingsTab from '../../../components/entrepreneur/settings/SettingsTab';
import TeamTab from '../../../components/entrepreneur/settings/TeamTab';
import EditClubLegalInfoPage from '../club/legal/EditClubLegalInfoPage';
import LegalCompliancePage from '../club/legal/LegalCompliancePage';

const Padded: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-4 py-6 lg:px-8">{children}</div>
);

const SettingsPage: React.FC = () => (
  <SimpleTabsPage
    label="Configuración"
    tabs={[
      { id: 'general', label: 'Ajustes', element: <Padded><SettingsTab /></Padded> },
      { id: 'legal', label: 'Legal', element: <EditClubLegalInfoPage /> },
      { id: 'compliance', label: 'Cumplimiento', element: <LegalCompliancePage /> },
      { id: 'team', label: 'Equipo', element: <Padded><TeamTab /></Padded> },
    ]}
  />
);

export default SettingsPage;
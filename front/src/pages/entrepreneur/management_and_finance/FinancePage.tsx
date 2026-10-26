import React from 'react';
import SimpleTabsPage from '../../../components/entrepreneur/layout/SimpleTabsPage';
import FinancialMovementsPage from './finance/FinancialMovementsPage';
import ProfitabilityPage from './finance/ProfitabilityPage';

const FinancePage: React.FC = () => (
  <SimpleTabsPage
    label="Finanzas"
    tabs={[
      { id: 'movements', label: 'Caja y movimientos', element: <FinancialMovementsPage /> },
      { id: 'profitability', label: 'Costos y rentabilidad', element: <ProfitabilityPage /> },
    ]}
  />
);

export default FinancePage;
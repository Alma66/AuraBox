import React from 'react';
import SimpleTabsPage from '../../../components/entrepreneur/layout/SimpleTabsPage';
import InventoryStockPage from './inventory_and_suppliers/InventoryStockPage';
import InventorySuppliersPage from './inventory_and_suppliers/InventorySuppliersPage';
import InventoryOrdersPage from './inventory_and_suppliers/InventoryOrdersPage';
import InventoryCategoriesPage from './inventory_and_suppliers/InventoryCategoriesPage';

const InventoryPage: React.FC = () => (
  <SimpleTabsPage
    label="Inventario"
    tabs={[
      { id: 'stock', label: 'Stock e insumos', element: <InventoryStockPage /> },
      { id: 'suppliers', label: 'Proveedores', element: <InventorySuppliersPage /> },
      { id: 'orders', label: 'Pedidos', element: <InventoryOrdersPage /> },
      { id: 'categories', label: 'Categorías', element: <InventoryCategoriesPage /> },
    ]}
  />
);

export default InventoryPage;
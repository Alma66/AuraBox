import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../api/config';
import InventorySidebar from '../../../components/entrepreneur/InventorySidebar';
import ProductStockContent from '../../../components/entrepreneur/inventory/ProductStockContent';
import SupplyCategoriesContent from '../../../components/entrepreneur/inventory/SupplyCategoriesContent';
import SuppliersContent from '../../../components/entrepreneur/inventory/SuppliersContent';
import SupplyOrdersContent from '../../../components/entrepreneur/inventory/SupplyOrdersContent';
import { useAuth } from '../../../App';
import { SupplyCategory, SupplierItem, ProductInventoryItem, SupplyOrderItem } from '../../../types/inventory';

const InventoryManagementPage: React.FC = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('stock');
  const [categories, setCategories] = useState<SupplyCategory[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [products, setProducts] = useState<ProductInventoryItem[]>([]);
  const [orders, setOrders] = useState<SupplyOrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const idClub = user?.managedClubId ? Number(user.managedClubId) : null;

  const fetchAll = useCallback(async () => {
    if (!idClub) return;
    setLoading(true);
    try {
      const [catsRes, supsRes, prodsRes, ordsRes] = await Promise.all([
        api.get(`/inventory/categories/by-club/${idClub}`),
        api.get(`/inventory/suppliers/by-club/${idClub}`),
        api.get(`/inventory/products/by-club/${idClub}`),
        api.get(`/inventory/orders/by-club/${idClub}`),
      ]);
      setCategories(getResponseData(catsRes) || []);
      setSuppliers(getResponseData(supsRes) || []);
      setProducts(getResponseData(prodsRes) || []);
      setOrders(getResponseData(ordsRes) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [idClub]);

  useEffect(() => {
    if (authLoading) return;
    if (userRole !== 'entrepreneur' || !idClub) {
      navigate('/login');
      return;
    }
    fetchAll();
  }, [authLoading, userRole, idClub, navigate, fetchAll]);

  if (authLoading || loading) {
    return <div className="text-center py-20 text-gray-500">Cargando inventario...</div>;
  }

  if (!idClub) {
    return <div className="text-center py-20 text-gray-500">Club no encontrado</div>;
  }

  const lowStockCount = products.filter((p) => Number(p.currentStock) <= Number(p.minStock)).length;

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Inventario y Proveedores</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/5">
          <InventorySidebar activeSection={activeSection} setActiveSection={setActiveSection} lowStockCount={lowStockCount} />
        </div>
        <div className="lg:w-4/5 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {activeSection === 'stock' && (
            <ProductStockContent idClub={idClub} products={products} categories={categories} suppliers={suppliers} onRefresh={fetchAll} />
          )}
          {activeSection === 'categorias' && (
            <SupplyCategoriesContent idClub={idClub} categories={categories} onRefresh={fetchAll} />
          )}
          {activeSection === 'proveedores' && (
            <SuppliersContent idClub={idClub} suppliers={suppliers} categories={categories} onRefresh={fetchAll} />
          )}
          {activeSection === 'pedidos' && (
            <SupplyOrdersContent idClub={idClub} orders={orders} products={products} suppliers={suppliers} onRefresh={fetchAll} />
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryManagementPage;
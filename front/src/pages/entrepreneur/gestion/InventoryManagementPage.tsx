import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../api/config';
import InventorySidebar from '../../../components/entrepreneur/InventorySidebar';
import ProductInventoryTable from '../../../components/entrepreneur/inventory/ProductInventoryTable';
import PackagingInventoryTable from '../../../components/entrepreneur/inventory/PackagingInventoryTable';
import MasterDataEditor from '../../../components/entrepreneur/inventory/MasterDataEditor';
import { useAuth } from '../../../App';
import { InventoryData, Product, Packaging, Supplier, ProductCategory } from '../../../types/inventory';

const InventoryManagementPage: React.FC = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('product-inventory');
  const [inventoryData, setInventoryData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (userRole !== 'entrepreneur' || !user?.managedClubId) {
        navigate('/login');
        return;
      }

      try {
        const response = await api.get(`/clubs/${user.managedClubId}/inventory`);
        const data = getResponseData(response);
        setInventoryData(data);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, userRole, navigate]);

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    if (!inventoryData) return;
    try {
      const response = await api.post(`/clubs/${user?.managedClubId}/inventory/products`, newProduct);
      const created = getResponseData(response);
      setInventoryData(prev => prev ? {
        ...prev,
        products: [...prev.products, { ...newProduct, id: created.id }]
      } : null);
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleEditProduct = async (updatedProduct: Product) => {
    if (!inventoryData) return;
    try {
      await api.put(`/clubs/${user?.managedClubId}/inventory/products/${updatedProduct.id}`, updatedProduct);
      setInventoryData(prev => prev ? {
        ...prev,
        products: prev.products.map(p => p.id === updatedProduct.id ? updatedProduct : p)
      } : null);
    } catch (error) {
      console.error("Error editing product:", error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!inventoryData) return;
    try {
      await api.delete(`/clubs/${user?.managedClubId}/inventory/products/${productId}`);
      setInventoryData(prev => prev ? {
        ...prev,
        products: prev.products.filter(p => p.id !== productId)
      } : null);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleAddPackaging = async (newPackaging: Omit<Packaging, 'id'>) => {
    if (!inventoryData) return;
    try {
      const response = await api.post(`/clubs/${user?.managedClubId}/inventory/packaging`, newPackaging);
      const created = getResponseData(response);
      setInventoryData(prev => prev ? {
        ...prev,
        packaging: [...prev.packaging, { ...newPackaging, id: created.id }]
      } : null);
    } catch (error) {
      console.error("Error adding packaging:", error);
    }
  };

  const handleEditPackaging = async (updatedPackaging: Packaging) => {
    if (!inventoryData) return;
    try {
      await api.put(`/clubs/${user?.managedClubId}/inventory/packaging/${updatedPackaging.id}`, updatedPackaging);
      setInventoryData(prev => prev ? {
        ...prev,
        packaging: prev.packaging.map(p => p.id === updatedPackaging.id ? updatedPackaging : p)
      } : null);
    } catch (error) {
      console.error("Error editing packaging:", error);
    }
  };

  const handleDeletePackaging = async (packagingId: string) => {
    if (!inventoryData) return;
    try {
      await api.delete(`/clubs/${user?.managedClubId}/inventory/packaging/${packagingId}`);
      setInventoryData(prev => prev ? {
        ...prev,
        packaging: prev.packaging.filter(p => p.id !== packagingId)
      } : null);
    } catch (error) {
      console.error("Error deleting packaging:", error);
    }
  };

  const handleAddSupplier = async (newSupplier: Omit<Supplier, 'id'>) => {
    if (!inventoryData) return;
    try {
      const response = await api.post(`/clubs/${user?.managedClubId}/inventory/suppliers`, newSupplier);
      const created = getResponseData(response);
      setInventoryData(prev => prev ? {
        ...prev,
        suppliers: [...prev.suppliers, { ...newSupplier, id: created.id }]
      } : null);
    } catch (error) {
      console.error("Error adding supplier:", error);
    }
  };

  const handleEditSupplier = async (updatedSupplier: Supplier) => {
    if (!inventoryData) return;
    try {
      await api.put(`/clubs/${user?.managedClubId}/inventory/suppliers/${updatedSupplier.id}`, updatedSupplier);
      setInventoryData(prev => prev ? {
        ...prev,
        suppliers: prev.suppliers.map(s => s.id === updatedSupplier.id ? updatedSupplier : s)
      } : null);
    } catch (error) {
      console.error("Error editing supplier:", error);
    }
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    if (!inventoryData) return;
    try {
      await api.delete(`/clubs/${user?.managedClubId}/inventory/suppliers/${supplierId}`);
      setInventoryData(prev => prev ? {
        ...prev,
        suppliers: prev.suppliers.filter(s => s.id !== supplierId)
      } : null);
    } catch (error) {
      console.error("Error deleting supplier:", error);
    }
  };

  const handleAddCategory = async (newCategory: Omit<ProductCategory, 'id'>) => {
    if (!inventoryData) return;
    try {
      const response = await api.post(`/clubs/${user?.managedClubId}/inventory/categories`, newCategory);
      const created = getResponseData(response);
      setInventoryData(prev => prev ? {
        ...prev,
        productCategories: [...prev.productCategories, { ...newCategory, id: created.id }]
      } : null);
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const handleEditCategory = async (updatedCategory: ProductCategory) => {
    if (!inventoryData) return;
    try {
      await api.put(`/clubs/${user?.managedClubId}/inventory/categories/${updatedCategory.id}`, updatedCategory);
      setInventoryData(prev => prev ? {
        ...prev,
        productCategories: prev.productCategories.map(c => c.id === updatedCategory.id ? updatedCategory : c)
      } : null);
    } catch (error) {
      console.error("Error editing category:", error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!inventoryData) return;
    try {
      await api.delete(`/clubs/${user?.managedClubId}/inventory/categories/${categoryId}`);
      setInventoryData(prev => prev ? {
        ...prev,
        productCategories: prev.productCategories.filter(c => c.id !== categoryId)
      } : null);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-20">Cargando inventario...</div>;
  }

  if (!inventoryData) {
    return <div className="text-center py-20">Error al cargar inventario.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Gestión de Inventario</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/5 pl-2">
          <InventorySidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        </div>

        <div className="lg:w-4/5 bg-white rounded-xl shadow-lg p-8 overflow-auto">
          {activeSection === 'product-inventory' && (
            <ProductInventoryTable
              products={inventoryData.products}
              suppliers={inventoryData.suppliers}
              productCategories={inventoryData.productCategories}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onAdd={handleAddProduct}
            />
          )}
          {activeSection === 'packaging-inventory' && (
            <PackagingInventoryTable
              packaging={inventoryData.packaging}
              suppliers={inventoryData.suppliers}
              onEdit={handleEditPackaging}
              onDelete={handleDeletePackaging}
              onAdd={handleAddPackaging}
            />
          )}
          {activeSection === 'master-data' && (
            <MasterDataEditor
              suppliers={inventoryData.suppliers}
              productCategories={inventoryData.productCategories}
              onAddSupplier={handleAddSupplier}
              onEditSupplier={handleEditSupplier}
              onDeleteSupplier={handleDeleteSupplier}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryManagementPage;
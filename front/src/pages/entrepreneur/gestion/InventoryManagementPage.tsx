import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InventorySidebar from '../../../components/entrepreneur/InventorySidebar';
import ProductInventoryTable from '../../../components/entrepreneur/inventory/ProductInventoryTable';
import PackagingInventoryTable from '../../../components/entrepreneur/inventory/PackagingInventoryTable';
import MasterDataEditor from '../../../components/entrepreneur/inventory/MasterDataEditor';
import { useAuth } from '../../../App';
import inventoryData from '../../../data/inventory.json';
import { InventoryData, Product, Packaging, Supplier, ProductCategory } from '../../../types/inventory';
const InventoryManagementPage: React.FC = () => {
  const { user, userRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('product-inventory');
  const [currentInventoryData, setCurrentInventoryData] = useState<InventoryData>(inventoryData as InventoryData); 
  useEffect(() => {
    if (!isAuthenticated || userRole !== 'entrepreneur') {
      navigate('/login');
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    const id = `prod${currentInventoryData.products.length + 1}`;
    setCurrentInventoryData(prev => ({
      ...prev,
      products: [...prev.products, { ...newProduct, id }]
    }));
  };

  const handleEditProduct = (updatedProduct: Product) => {
    setCurrentInventoryData(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    }));
  };

  const handleDeleteProduct = (productId: string) => {
    setCurrentInventoryData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId)
    }));
  };

  const handleAddPackaging = (newPackaging: Omit<Packaging, 'id'>) => {
    const id = `pack${currentInventoryData.packaging.length + 1}`;
    setCurrentInventoryData(prev => ({
      ...prev,
      packaging: [...prev.packaging, { ...newPackaging, id }]
    }));
  };

  const handleEditPackaging = (updatedPackaging: Packaging) => {
    setCurrentInventoryData(prev => ({
      ...prev,
      packaging: prev.packaging.map(p => p.id === updatedPackaging.id ? updatedPackaging : p)
    }));
  };

  const handleDeletePackaging = (packagingId: string) => {
    setCurrentInventoryData(prev => ({
      ...prev,
      packaging: prev.packaging.filter(p => p.id !== packagingId)
    }));
  };

  const handleAddSupplier = (newSupplier: Omit<Supplier, 'id'>) => { 
    const id = `sup${currentInventoryData.suppliers.length + 1}`;
    setCurrentInventoryData(prev => ({
      ...prev,
      suppliers: [...prev.suppliers, { ...newSupplier, id }]
    }));
  };

  const handleEditSupplier = (updatedSupplier: Supplier) => { 3
    setCurrentInventoryData(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(s => s.id === updatedSupplier.id ? updatedSupplier : s)
    }));
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setCurrentInventoryData(prev => ({
      ...prev,
      suppliers: prev.suppliers.filter(s => s.id !== supplierId)
    }));
  };

  const handleAddCategory = (newCategory: Omit<ProductCategory, 'id'>) => {
    const id = `cat${currentInventoryData.productCategories.length + 1}`;
    setCurrentInventoryData(prev => ({
      ...prev,
      productCategories: [...prev.productCategories, { ...newCategory, id }]
    }));
  };

  const handleEditCategory = (updatedCategory: ProductCategory) => {
    setCurrentInventoryData(prev => ({
      ...prev,
      productCategories: prev.productCategories.map(c => c.id === updatedCategory.id ? updatedCategory : c)
    }));
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCurrentInventoryData(prev => ({
      ...prev,
      productCategories: prev.productCategories.filter(c => c.id !== categoryId)
    }));
  };

  if (!isAuthenticated || userRole !== 'entrepreneur') {
    return <div className="text-center py-20">Redirigiendo...</div>;
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
              products={currentInventoryData.products}
              suppliers={currentInventoryData.suppliers}
              productCategories={currentInventoryData.productCategories}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onAdd={handleAddProduct}
            />
          )}
          {activeSection === 'packaging-inventory' && (
            <PackagingInventoryTable
              packaging={currentInventoryData.packaging}
              suppliers={currentInventoryData.suppliers}
              onEdit={handleEditPackaging}
              onDelete={handleDeletePackaging}
              onAdd={handleAddPackaging}
            />
          )}
          {activeSection === 'master-data' && (
            <MasterDataEditor
              suppliers={currentInventoryData.suppliers}
              productCategories={currentInventoryData.productCategories}
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
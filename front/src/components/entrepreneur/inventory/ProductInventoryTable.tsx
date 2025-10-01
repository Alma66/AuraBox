import React, { useState } from 'react';
import { Product, Supplier, ProductCategory, UnitType } from '../../../types/inventory';

interface ProductInventoryTableProps {
  products: Product[];
  suppliers: Supplier[];
  productCategories: ProductCategory[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onAdd: (product: Omit<Product, 'id'>) => void;
}

const unitOptions: UnitType[] = ['unidad', 'paquete', 'gramos', 'porción', 'kg', 'litro', 'ml', 'metro', 'cm'];

const ProductInventoryTable: React.FC<ProductInventoryTableProps> = ({
  products,
  suppliers,
  productCategories,
  onEdit,
  onDelete,
  onAdd,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    category: productCategories.length > 0 ? productCategories[0].id : '',
    supplierId: suppliers.length > 0 ? suppliers[0].id : '',
    unitType: 'unidad',
    currentStock: 0,
    minStock: 0,
    costPerUnit: 0,
  });

  const handleAddClick = () => setIsAdding(true);
  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewProduct({
      name: '',
      description: '',
      category: productCategories.length > 0 ? productCategories[0].id : '',
      supplierId: suppliers.length > 0 ? suppliers[0].id : '',
      unitType: 'unidad',
      currentStock: 0,
      minStock: 0,
      costPerUnit: 0,
    });
  };

  const handleSaveAdd = () => {
    if (newProduct.name.trim() === '') {
      alert('El nombre es obligatorio');
      return;
    }
    onAdd(newProduct);
    handleCancelAdd();
  };

  const getSupplierName = (supplierId: string) => suppliers.find(s => s.id === supplierId)?.name || 'Desconocido';
  const getCategoryName = (categoryId: string) => productCategories.find(c => c.id === categoryId)?.name || 'Sin Categoría';

  return (
    <div className="overflow-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Inventario de Productos</h2>
      <button
        onClick={handleAddClick}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Agregar Producto
      </button>

      {isAdding && (
        <div className="mb-6 p-4 border border-gray-300 rounded">
          <h3 className="text-lg font-medium mb-2">Nuevo Producto</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Nombre"
              value={newProduct.name}
              onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
              className="border p-2 rounded"
            />
            <select
              value={newProduct.category}
              onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
              className="border p-2 rounded"
            >
              {productCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select
              value={newProduct.supplierId}
              onChange={e => setNewProduct({ ...newProduct, supplierId: e.target.value })}
              className="border p-2 rounded"
            >
              {suppliers.map(sup => (
                <option key={sup.id} value={sup.id}>{sup.name}</option>
              ))}
            </select>
            <select
              value={newProduct.unitType}
              onChange={e => setNewProduct({ ...newProduct, unitType: e.target.value as UnitType })}
              className="border p-2 rounded"
            >
              {unitOptions.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Stock Actual"
              value={newProduct.currentStock}
              onChange={e => setNewProduct({ ...newProduct, currentStock: Number(e.target.value) })}
              className="border p-2 rounded"
              min={0}
            />
            <input
              type="number"
              placeholder="Stock Mínimo"
              value={newProduct.minStock}
              onChange={e => setNewProduct({ ...newProduct, minStock: Number(e.target.value) })}
              className="border p-2 rounded"
              min={0}
            />
            <input
              type="number"
              placeholder="Costo por Unidad"
              value={newProduct.costPerUnit}
              onChange={e => setNewProduct({ ...newProduct, costPerUnit: Number(e.target.value) })}
              className="border p-2 rounded"
              min={0}
              step="0.01"
            />
          </div>
          <div className="mt-4 space-x-2">
            <button onClick={handleSaveAdd} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
              Guardar
            </button>
            <button onClick={handleCancelAdd} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <table className="min-w-full divide-y divide-gray-200 table-auto">
        <thead className="bg-gray-50">
          <tr>
            <th className="sticky left-0 bg-gray-50 z-10 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
              Nombre
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
              Tipo de Unidad
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
              Categoría
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
              Proveedor
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
              Stock Actual
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
              Stock Mínimo
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
              Costo por Unidad
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map(product => (
            <tr key={product.id} className={product.currentStock <= product.minStock ? 'bg-red-50' : ''}>
              <td className="sticky left-0 bg-white z-0 px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                {product.name}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{product.unitType}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{getCategoryName(product.category)}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{getSupplierName(product.supplierId)}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{product.currentStock}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{product.minStock}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{product.costPerUnit.toFixed(2)}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2">
                <button
                  onClick={() => onEdit(product)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(product.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center py-4 text-gray-500">
                No hay productos en el inventario.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductInventoryTable;
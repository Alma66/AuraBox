import React, { useState } from 'react';
import { Supplier, ProductCategory } from '../../../types/inventory';

interface MasterDataEditorProps {
  suppliers: Supplier[];
  productCategories: ProductCategory[];
  onAddSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplierId: string) => void;
  onAddCategory: (category: Omit<ProductCategory, 'id'>) => void;
  onEditCategory: (category: ProductCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const MasterDataEditor: React.FC<MasterDataEditorProps> = ({
  suppliers,
  productCategories,
  onAddSupplier,
  onEditSupplier,
  onDeleteSupplier,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const [newSupplier, setNewSupplier] = useState<Omit<Supplier, 'id'>>({
    name: '',
    mail: '',
    phone: '',
    type: 'general',
  });
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [newCategory, setNewCategory] = useState<Omit<ProductCategory, 'id'>>({
    name: '',
    description: '',
  });
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);

  const handleAddSupplier = () => {
    if (!newSupplier.name.trim() || !newSupplier.mail.trim()) {
      alert('Nombre y mail son obligatorios');
      return;
    }
    onAddSupplier(newSupplier);
    setNewSupplier({ name: '', mail: '', phone: '', type: 'general' });
  };

  const handleUpdateSupplier = () => {
    if (editingSupplier) {
      if (!editingSupplier.name.trim() || !editingSupplier.mail.trim()) {
        alert('Nombre y mail son obligatorios');
        return;
      }
      onEditSupplier(editingSupplier);
      setEditingSupplier(null);
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      alert('El nombre de la categoría es obligatorio');
      return;
    }
    onAddCategory(newCategory);
    setNewCategory({ name: '', description: '' });
  };

  const handleUpdateCategory = () => {
    if (editingCategory) {
      if (!editingCategory.name.trim()) {
        alert('El nombre de la categoría es obligatorio');
        return;
      }
      onEditCategory(editingCategory);
      setEditingCategory(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 overflow-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Gestión de Datos Maestros</h2>

      <section className="mb-10">
        <h3 className="text-xl font-medium text-gray-700 mb-4">Proveedores</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="Nombre del Proveedor"
            className="p-2 border border-gray-300 rounded-md"
            value={editingSupplier ? editingSupplier.name : newSupplier.name}
            onChange={e =>
              editingSupplier
                ? setEditingSupplier({ ...editingSupplier, name: e.target.value })
                : setNewSupplier({ ...newSupplier, name: e.target.value })
            }
          />
          <input
            type="email"
            placeholder="Mail"
            className="p-2 border border-gray-300 rounded-md"
            value={editingSupplier ? editingSupplier.mail : newSupplier.mail}
            onChange={e =>
              editingSupplier
                ? setEditingSupplier({ ...editingSupplier, mail: e.target.value })
                : setNewSupplier({ ...newSupplier, mail: e.target.value })
            }
          />
          <input
            type="tel"
            placeholder="Número de Teléfono"
            className="p-2 border border-gray-300 rounded-md"
            value={editingSupplier ? editingSupplier.phone : newSupplier.phone}
            onChange={e =>
              editingSupplier
                ? setEditingSupplier({ ...editingSupplier, phone: e.target.value })
                : setNewSupplier({ ...newSupplier, phone: e.target.value })
            }
          />
          <select
            className="p-2 border border-gray-300 rounded-md"
            value={editingSupplier ? editingSupplier.type : newSupplier.type}
            onChange={e =>
              editingSupplier
                ? setEditingSupplier({ ...editingSupplier, type: e.target.value as any })
                : setNewSupplier({ ...newSupplier, type: e.target.value as any })
            }
          >
            <option value="general">General</option>
            <option value="product">Producto</option>
            <option value="packaging">Packaging</option>
          </select>
        </div>
        <div className="mb-6">
          {editingSupplier ? (
            <>
              <button
                onClick={handleUpdateSupplier}
                className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 mr-3"
              >
                Actualizar Proveedor
              </button>
              <button
                onClick={() => setEditingSupplier(null)}
                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={handleAddSupplier}
              className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Agregar Proveedor
            </button>
          )}
        </div>
                <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mail
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.map(supplier => (
                <tr key={supplier.id}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{supplier.name}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.mail || 'N/A'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.phone || 'N/A'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{supplier.type}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setEditingSupplier(supplier)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDeleteSupplier(supplier.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No hay proveedores registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-medium text-gray-700 mb-4">Categorías de Productos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Nombre de la Categoría"
            className="p-2 border border-gray-300 rounded-md"
            value={editingCategory ? editingCategory.name : newCategory.name}
            onChange={e =>
              editingCategory
                ? setEditingCategory({ ...editingCategory, name: e.target.value })
                : setNewCategory({ ...newCategory, name: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Descripción (opcional)"
            className="p-2 border border-gray-300 rounded-md"
            value={editingCategory ? editingCategory.description || '' : newCategory.description}
            onChange={e =>
              editingCategory
                ? setEditingCategory({ ...editingCategory, description: e.target.value })
                : setNewCategory({ ...newCategory, description: e.target.value })
            }
          />
        </div>
        <div className="mb-6">
          {editingCategory ? (
            <>
              <button
                onClick={handleUpdateCategory}
                className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 mr-3"
              >
                Actualizar Categoría
              </button>
              <button
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={handleAddCategory}
              className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Agregar Categoría
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productCategories.map(category => (
                <tr key={category.id}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{category.description || 'N/A'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {productCategories.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-gray-500">
                    No hay categorías registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default MasterDataEditor;
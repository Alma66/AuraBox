import React, { useMemo, useState } from 'react';
import api from '../../../api/config';
import { ProductInventoryItem, SupplyCategory, SupplierItem } from '../../../types/inventory';

interface ProductStockContentProps {
  idClub: number;
  products: ProductInventoryItem[];
  categories: SupplyCategory[];
  suppliers: SupplierItem[];
  onRefresh: () => void;
}

const UNIT_OPTIONS = ['unidad', 'kg', 'gramos', 'litro', 'ml', 'paquete', 'metro', 'cm'];

const emptyForm = {
  name: '',
  description: '',
  idSupplyCategory: '',
  idSupplier: '',
  unitType: 'unidad',
  currentStock: '0',
  minStock: '0',
  costPerUnit: '0',
};

const ProductStockContent: React.FC<ProductStockContentProps> = ({ idClub, products, categories, suppliers, onRefresh }) => {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLowStock, setFilterLowStock] = useState(false);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.idSupplyCategory) {
      alert('Nombre y categoría son obligatorios');
      return;
    }
    const payload = {
      idClub,
      idSupplyCategory: Number(form.idSupplyCategory),
      idSupplier: form.idSupplier ? Number(form.idSupplier) : undefined,
      name: form.name,
      description: form.description || undefined,
      unitType: form.unitType,
      currentStock: Number(form.currentStock),
      minStock: Number(form.minStock),
      costPerUnit: Number(form.costPerUnit),
    };
    try {
      if (editingId) {
        await api.put(`/inventory/products/${editingId}`, payload);
      } else {
        await api.post('/inventory/products', payload);
      }
      resetForm();
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Error al guardar el producto');
    }
  };

  const loadForEdit = (p: ProductInventoryItem) => {
    setForm({
      name: p.name,
      description: p.description ?? '',
      idSupplyCategory: String(p.idSupplyCategory),
      idSupplier: p.idSupplier ? String(p.idSupplier) : '',
      unitType: p.unitType,
      currentStock: p.currentStock,
      minStock: p.minStock,
      costPerUnit: p.costPerUnit,
    });
    setEditingId(p.id);
  };

  const removeProduct = async (id: number) => {
    if (!window.confirm('¿Eliminar este producto del inventario?')) return;
    try {
      await api.delete(`/inventory/products/${id}`);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message ?? 'Error al eliminar el producto');
    }
  };

  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name ?? 'Sin categoría';
  const supplierName = (id?: number | null) => suppliers.find((s) => s.id === id)?.name ?? '—';

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filterCategory !== 'all' && String(p.idSupplyCategory) !== filterCategory) return false;
      if (filterLowStock && Number(p.currentStock) > Number(p.minStock)) return false;
      return true;
    });
  }, [products, filterCategory, filterLowStock]);

  return (
    <div className="animate-fadeInUp">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Stock e Insumos</h2>

      <div className="border border-gray-200 rounded-xl p-5 mb-8 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input type="text" placeholder="Nombre del insumo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <select value={form.idSupplyCategory} onChange={(e) => setForm({ ...form, idSupplyCategory: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">Categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={form.idSupplier} onChange={(e) => setForm({ ...form, idSupplier: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">Proveedor habitual (opcional)</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select value={form.unitType} onChange={(e) => setForm({ ...form, unitType: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            {UNIT_OPTIONS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          <input type="number" placeholder="Stock actual" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input type="number" placeholder="Stock mínimo" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input type="number" placeholder="Costo por unidad" value={form.costPerUnit} onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <input type="text" placeholder="Descripción (opcional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        <div className="flex gap-3">
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            {editingId ? 'Guardar cambios' : 'Agregar insumo'}
          </button>
          {editingId && (
            <button onClick={resetForm} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <label className="flex items-center text-sm text-gray-600">
          <input type="checkbox" checked={filterLowStock} onChange={(e) => setFilterLowStock(e.target.checked)} className="mr-2" />
          Solo stock bajo
        </label>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-xl">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Categoría</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Proveedor</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Stock</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Mínimo</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Costo/u</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((p) => {
              const low = Number(p.currentStock) <= Number(p.minStock);
              return (
                <tr key={p.id} className={low ? 'bg-red-50' : ''}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{categoryName(p.idSupplyCategory)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{supplierName(p.idSupplier)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{p.currentStock} {p.unitType}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-right">{p.minStock}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 text-right">${Number(p.costPerUnit).toLocaleString('es-AR')}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => loadForEdit(p)} className="text-xs font-medium px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 mr-1">
                      Editar
                    </button>
                    <button onClick={() => removeProduct(p.id)} className="text-xs font-medium px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-8 text-gray-500">No hay insumos para mostrar.</p>}
      </div>
    </div>
  );
};

export default ProductStockContent;
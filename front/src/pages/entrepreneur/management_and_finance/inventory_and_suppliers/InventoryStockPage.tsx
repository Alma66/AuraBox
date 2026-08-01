import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../../api/config';
import { useAuth } from '../../../../App';
import { SupplyCategory, SupplierItem, ProductInventoryItem } from '../../../../types/inventory';
import toast from 'react-hot-toast';

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

type SortKey = 'name' | 'stock' | 'cost';

const InventoryStockPage: React.FC = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const idClub = user?.managedClubId ? Number(user.managedClubId) : null;

  const [categories, setCategories] = useState<SupplyCategory[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [products, setProducts] = useState<ProductInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('name');

  const fetchAll = useCallback(async () => {
    if (!idClub) return;
    setLoading(true);
    try {
      const [catsRes, supsRes, prodsRes] = await Promise.all([
        api.get(`/inventory/categories/by-club/${idClub}`),
        api.get(`/inventory/suppliers/by-club/${idClub}`),
        api.get(`/inventory/products/by-club/${idClub}`),
      ]);
      setCategories(getResponseData(catsRes) || []);
      setSuppliers(getResponseData(supsRes) || []);
      setProducts(getResponseData(prodsRes) || []);
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

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
  if (!form.name.trim() || !form.idSupplyCategory) {
    toast.error('Nombre y categoría son obligatorios');
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
    fetchAll();
  } catch (err) {
    console.error(err);
    toast.error('Error al guardar el producto');
  }
};

const removeProduct = (id: number) => {
  toast((t) => (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">¿Eliminar este insumo del inventario?</p>
      <div className="flex gap-2 justify-end">
        <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancelar
        </button>
        <button
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              await api.delete(`/inventory/products/${id}`);
              fetchAll();
            } catch (err: any) {
              console.error(err);
              toast.error(err?.response?.data?.message ?? 'Error al eliminar el insumo');
            }
          }}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Eliminar
        </button>
      </div>
    </div>
  ), { duration: Infinity });
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name ?? 'Sin categoría';
  const supplierName = (id?: number | null) => suppliers.find((s) => s.id === id)?.name ?? '—';

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (filterCategory !== 'all' && String(p.idSupplyCategory) !== filterCategory) return false;
      if (filterLowStock && Number(p.currentStock) > Number(p.minStock)) return false;
      if (search.trim() && !p.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      if (sortKey === 'stock') return Number(a.currentStock) - Number(b.currentStock);
      return Number(b.costPerUnit) - Number(a.costPerUnit);
    });
    return list;
  }, [products, filterCategory, filterLowStock, search, sortKey]);

  const lowStockCount = products.filter((p) => Number(p.currentStock) <= Number(p.minStock)).length;
  const totalValue = products.reduce((acc, p) => acc + Number(p.currentStock) * Number(p.costPerUnit), 0);

  const exportCsv = () => {
    const header = ['Nombre', 'Categoría', 'Proveedor', 'Stock', 'Mínimo', 'Unidad', 'Costo/u'];
    const rows = filtered.map((p) => [
      p.name,
      categoryName(p.idSupplyCategory),
      supplierName(p.idSupplier),
      p.currentStock,
      p.minStock,
      p.unitType,
      p.costPerUnit,
    ]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stock-insumos.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || loading) {
    return <div className="text-center py-20 text-gray-500">Cargando stock e insumos...</div>;
  }

  if (!idClub) {
    return <div className="text-center py-20 text-gray-500">Club no encontrado</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Stock e Insumos</h1>
      <p className="text-sm text-gray-500 mb-8">Controlá el inventario de materia prima y packaging de tu club.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase">Insumos totales</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{products.length}</p>
        </div>
        <div className={`rounded-xl border p-5 ${lowStockCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
          <p className="text-xs font-semibold text-gray-500 uppercase">Stock bajo</p>
          <p className={`text-2xl font-bold mt-1 ${lowStockCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>{lowStockCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase">Valor total en stock</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">${totalValue.toLocaleString('es-AR')}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input type="text" placeholder="Buscar por nombre..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1 min-w-[180px]" />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="name">Ordenar: Nombre</option>
            <option value="stock">Ordenar: Stock</option>
            <option value="cost">Ordenar: Costo</option>
          </select>
          <label className="flex items-center text-sm text-gray-600">
            <input type="checkbox" checked={filterLowStock} onChange={(e) => setFilterLowStock(e.target.checked)} className="mr-2" />
            Solo stock bajo
          </label>
          <button onClick={exportCsv} className="ml-auto px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">
            Exportar CSV
          </button>
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
    </div>
  );
};

export default InventoryStockPage;
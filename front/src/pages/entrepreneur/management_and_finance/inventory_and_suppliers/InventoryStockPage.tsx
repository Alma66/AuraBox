import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../../../api/config';
import { useAuth } from '../../../../App';
import ConfirmDialog from '../../../../components/admin/ConfirmDialog';
import LoadError from '../../../../components/entrepreneur/LoadError';
import { SupplyCategory, SupplierItem, ProductInventoryItem } from '../../../../types/inventory';

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

const fieldClass =
  'px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm text-aurora-navy bg-white focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40 focus:border-aurora-terracotta';

const thClass = 'px-4 py-3 text-xs font-semibold text-aurora-navy/60 uppercase';

const InventoryStockPage: React.FC = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const idClub = user?.managedClubId ? Number(user.managedClubId) : null;

  const [categories, setCategories] = useState<SupplyCategory[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [products, setProducts] = useState<ProductInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductInventoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('name');

  const fetchAll = useCallback(async () => {
    if (!idClub) return;
    setLoading(true);
    setFailed(false);
    try {
      const [catsRes, supsRes, prodsRes] = await Promise.all([
        api.get(`/inventory/categories/by-club/${idClub}`),
        api.get(`/inventory/suppliers/by-club/${idClub}`),
        api.get(`/inventory/products/by-club/${idClub}`),
      ]);
      setCategories(getResponseData(catsRes) || []);
      setSuppliers(getResponseData(supsRes) || []);
      setProducts(getResponseData(prodsRes) || []);
    } catch {
      setFailed(true);
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
    if (saving) return;
    const name = form.name.trim();
    if (!name || !form.idSupplyCategory) {
      toast.error('Nombre y categoría son obligatorios');
      return;
    }
    const currentStock = Number(form.currentStock);
    const minStock = Number(form.minStock);
    const costPerUnit = Number(form.costPerUnit);
    if ([currentStock, minStock, costPerUnit].some((value) => !Number.isFinite(value) || value < 0)) {
      toast.error('El stock, el mínimo y el costo no pueden ser negativos');
      return;
    }
    const payload = {
      idClub,
      idSupplyCategory: Number(form.idSupplyCategory),
      idSupplier: form.idSupplier ? Number(form.idSupplier) : null,
      name,
      description: form.description.trim() || null,
      unitType: form.unitType,
      currentStock,
      minStock,
      costPerUnit,
    };
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/inventory/products/${editingId}`, payload);
        toast.success('Insumo actualizado');
      } else {
        await api.post('/inventory/products', payload);
        toast.success('Insumo agregado');
      }
      resetForm();
      fetchAll();
    } catch (err: any) {
      const message = err?.response?.data?.message;
      toast.error(typeof message === 'string' ? message : 'No se pudo guardar el insumo.');
    } finally {
      setSaving(false);
    }
  };

  const confirmRemove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/inventory/products/${deleteTarget.id}`);
      toast.success('Insumo eliminado');
      if (editingId === deleteTarget.id) resetForm();
      setDeleteTarget(null);
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'No se pudo eliminar el insumo.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
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
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stock-insumos.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || (loading && products.length === 0 && !failed)) {
    return (
      <div className="animate-pulse space-y-6 px-4 py-6 lg:px-8" aria-busy="true">
        <div className="h-8 w-64 rounded bg-aurora-navy/10" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-24 rounded-xl bg-aurora-navy/10" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-aurora-navy/10" />
      </div>
    );
  }

  if (failed) {
    return <LoadError title="No pudimos cargar tu inventario." onRetry={fetchAll} />;
  }

  if (!idClub) {
    return <div className="text-center py-20 text-aurora-navy/60">Club no encontrado</div>;
  }

  return (
    <div className="px-4 py-6 lg:px-8">
      <h1 className="text-2xl font-bold text-aurora-navy mb-2">Stock e Insumos</h1>
      <p className="text-sm text-aurora-navy/60 mb-8">Controlá el inventario de materia prima y packaging de tu club.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-aurora-navy/10 p-5">
          <p className="text-xs font-semibold text-aurora-navy/60 uppercase">Insumos totales</p>
          <p className="text-2xl font-bold text-aurora-navy mt-1">{products.length}</p>
        </div>
        <div className={`rounded-xl border p-5 ${lowStockCount > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-aurora-navy/10'}`}>
          <p className="text-xs font-semibold text-aurora-navy/60 uppercase">Stock bajo</p>
          <p className={`text-2xl font-bold mt-1 ${lowStockCount > 0 ? 'text-red-600' : 'text-aurora-navy'}`}>{lowStockCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-aurora-navy/10 p-5">
          <p className="text-xs font-semibold text-aurora-navy/60 uppercase">Valor total en stock</p>
          <p className="text-2xl font-bold text-aurora-navy mt-1">${totalValue.toLocaleString('es-AR')}</p>
        </div>
      </div>

      <div className={`bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-6 transition-opacity ${loading ? 'opacity-60' : ''}`}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
          className="border border-aurora-navy/10 rounded-xl p-5 mb-8 space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input type="text" aria-label="Nombre del insumo" maxLength={120} placeholder="Nombre del insumo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldClass} />
            <select aria-label="Categoría" value={form.idSupplyCategory} onChange={(e) => setForm({ ...form, idSupplyCategory: e.target.value })} className={fieldClass}>
              <option value="">Categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select aria-label="Proveedor habitual" value={form.idSupplier} onChange={(e) => setForm({ ...form, idSupplier: e.target.value })} className={fieldClass}>
              <option value="">Proveedor habitual (opcional)</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select aria-label="Unidad" value={form.unitType} onChange={(e) => setForm({ ...form, unitType: e.target.value })} className={fieldClass}>
              {UNIT_OPTIONS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
            <input type="number" min="0" step="any" aria-label="Stock actual" placeholder="Stock actual" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: e.target.value })} className={fieldClass} />
            <input type="number" min="0" step="any" aria-label="Stock mínimo" placeholder="Stock mínimo" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} className={fieldClass} />
            <input type="number" min="0" step="any" aria-label="Costo por unidad" placeholder="Costo por unidad" value={form.costPerUnit} onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })} className={fieldClass} />
          </div>
          <input type="text" aria-label="Descripción" maxLength={300} placeholder="Descripción (opcional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`w-full ${fieldClass}`} />
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-aurora-terracotta text-white text-sm font-medium rounded-lg hover:bg-aurora-terracottaDark disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Agregar insumo'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-aurora-navy/10 text-aurora-navy text-sm font-medium rounded-lg hover:bg-aurora-navy/15">
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input type="search" aria-label="Buscar por nombre" placeholder="Buscar por nombre..." value={search} onChange={(e) => setSearch(e.target.value)} className={`${fieldClass} flex-1 min-w-[180px]`} />
          <select aria-label="Filtrar por categoría" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={fieldClass}>
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select aria-label="Ordenar por" value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className={fieldClass}>
            <option value="name">Ordenar: Nombre</option>
            <option value="stock">Ordenar: Stock</option>
            <option value="cost">Ordenar: Costo</option>
          </select>
          <label className="flex items-center text-sm text-aurora-navy/70">
            <input type="checkbox" checked={filterLowStock} onChange={(e) => setFilterLowStock(e.target.checked)} className="mr-2 h-4 w-4 rounded border-aurora-navy/25 text-aurora-terracotta focus:ring-aurora-terracotta" />
            Solo stock bajo
          </label>
          <button type="button" onClick={exportCsv} disabled={filtered.length === 0} className="ml-auto px-4 py-2 bg-aurora-navy/10 text-aurora-navy text-sm font-medium rounded-lg hover:bg-aurora-navy/15 disabled:cursor-not-allowed disabled:opacity-50">
            Exportar CSV
          </button>
        </div>

        <div className="overflow-x-auto border border-aurora-navy/10 rounded-xl">
          <table className="min-w-full divide-y divide-aurora-navy/10">
            <thead className="bg-aurora-cream">
              <tr>
                <th scope="col" className={`${thClass} text-left`}>Nombre</th>
                <th scope="col" className={`${thClass} text-left`}>Categoría</th>
                <th scope="col" className={`${thClass} text-left`}>Proveedor</th>
                <th scope="col" className={`${thClass} text-right`}>Stock</th>
                <th scope="col" className={`${thClass} text-right`}>Mínimo</th>
                <th scope="col" className={`${thClass} text-right`}>Costo/u</th>
                <th scope="col" className={`${thClass} text-center`}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aurora-navy/10">
              {filtered.map((p) => {
                const low = Number(p.currentStock) <= Number(p.minStock);
                return (
                  <tr key={p.id} className={low ? 'bg-red-50' : ''}>
                    <td className="px-4 py-3 text-sm font-medium text-aurora-navy">
                      {p.name}
                      {low && <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Stock bajo</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-aurora-navy/70">{categoryName(p.idSupplyCategory)}</td>
                    <td className="px-4 py-3 text-sm text-aurora-navy/70">{supplierName(p.idSupplier)}</td>
                    <td className="px-4 py-3 text-sm text-aurora-navy text-right">{p.currentStock} {p.unitType}</td>
                    <td className="px-4 py-3 text-sm text-aurora-navy/70 text-right">{p.minStock}</td>
                    <td className="px-4 py-3 text-sm text-aurora-navy/70 text-right">${Number(p.costPerUnit).toLocaleString('es-AR')}</td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button type="button" onClick={() => loadForEdit(p)} aria-label={`Editar ${p.name}`} className="text-xs font-medium px-2 py-1 rounded bg-aurora-terracotta/10 text-aurora-terracottaDark hover:bg-aurora-terracotta/20 mr-1">
                        Editar
                      </button>
                      <button type="button" onClick={() => setDeleteTarget(p)} aria-label={`Eliminar ${p.name}`} className="text-xs font-medium px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center py-8 text-aurora-navy/60">
              {products.length === 0 ? 'Todavía no cargaste insumos.' : 'No hay insumos que coincidan con los filtros.'}
            </p>
          )}
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Eliminar insumo"
          description={`Se va a eliminar "${deleteTarget.name}" del inventario. Si tiene pedidos asociados, no se va a poder eliminar.`}
          confirmLabel="Eliminar"
          danger
          saving={deleting}
          onConfirm={confirmRemove}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default InventoryStockPage;
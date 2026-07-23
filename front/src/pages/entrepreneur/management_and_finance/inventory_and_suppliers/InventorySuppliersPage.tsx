import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../../api/config';
import { useAuth } from '../../../../App';
import { SupplierItem, SupplyCategory, SupplyOrderItem, ProductInventoryItem } from '../../../../types/inventory';

const emptyForm = {
  name: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  notes: '',
  categoryIds: [] as number[],
};

type SortKey = 'name' | 'spend';

const InventorySuppliersPage: React.FC = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const idClub = user?.managedClubId ? Number(user.managedClubId) : null;

  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [categories, setCategories] = useState<SupplyCategory[]>([]);
  const [orders, setOrders] = useState<SupplyOrderItem[]>([]);
  const [products, setProducts] = useState<ProductInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterActive, setFilterActive] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');

  const fetchAll = useCallback(async () => {
    if (!idClub) return;
    setLoading(true);
    try {
      const [supsRes, catsRes, ordsRes, prodsRes] = await Promise.all([
        api.get(`/inventory/suppliers/by-club/${idClub}`),
        api.get(`/inventory/categories/by-club/${idClub}`),
        api.get(`/inventory/orders/by-club/${idClub}`),
        api.get(`/inventory/products/by-club/${idClub}`),
      ]);
      setSuppliers(getResponseData(supsRes) || []);
      setCategories(getResponseData(catsRes) || []);
      setOrders(getResponseData(ordsRes) || []);
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

  const toggleCategory = (id: number) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id) ? prev.categoryIds.filter((x) => x !== id) : [...prev.categoryIds, id],
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      alert('El nombre del proveedor es obligatorio');
      return;
    }
    const payload = {
      idClub,
      name: form.name,
      contactEmail: form.contactEmail || undefined,
      contactPhone: form.contactPhone || undefined,
      address: form.address || undefined,
      notes: form.notes || undefined,
      categoryIds: form.categoryIds,
    };
    try {
      if (editingId) {
        await api.put(`/inventory/suppliers/${editingId}`, payload);
      } else {
        await api.post('/inventory/suppliers', payload);
      }
      resetForm();
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Error al guardar el proveedor');
    }
  };

  const loadForEdit = (s: SupplierItem) => {
    setForm({
      name: s.name,
      contactEmail: s.contactEmail ?? '',
      contactPhone: s.contactPhone ?? '',
      address: s.address ?? '',
      notes: s.notes ?? '',
      categoryIds: s.categoryIds,
    });
    setEditingId(s.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeSupplier = async (id: number) => {
    if (!window.confirm('¿Eliminar este proveedor?')) return;
    try {
      await api.delete(`/inventory/suppliers/${id}`);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el proveedor');
    }
  };

  const toggleActive = async (s: SupplierItem) => {
    try {
      await api.put(`/inventory/suppliers/${s.id}`, { active: !s.active });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Error al cambiar el estado del proveedor');
    }
  };

  const categoryNames = (ids: number[]) => ids.map((id) => categories.find((c) => c.id === id)?.name).filter(Boolean).join(', ') || 'Sin categoría';

  const spendBySupplier = useMemo(() => {
    const map: Record<number, number> = {};
    orders.filter((o) => o.status === 'Recibido').forEach((o) => {
      map[o.idSupplier] = (map[o.idSupplier] ?? 0) + Number(o.totalCost);
    });
    return map;
  }, [orders]);

  const productsCountBySupplier = useMemo(() => {
    const map: Record<number, number> = {};
    products.forEach((p) => {
      if (p.idSupplier) map[p.idSupplier] = (map[p.idSupplier] ?? 0) + 1;
    });
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    let list = suppliers.filter((s) => {
      if (filterCategory !== 'all' && !s.categoryIds.includes(Number(filterCategory))) return false;
      if (filterActive === 'active' && !s.active) return false;
      if (filterActive === 'inactive' && s.active) return false;
      if (search.trim() && !s.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name);
      return (spendBySupplier[b.id] ?? 0) - (spendBySupplier[a.id] ?? 0);
    });
    return list;
  }, [suppliers, filterCategory, filterActive, search, sortKey, spendBySupplier]);

  const activeCount = suppliers.filter((s) => s.active).length;
  const categoriesCovered = new Set(suppliers.flatMap((s) => s.categoryIds)).size;

  if (authLoading || loading) {
    return <div className="text-center py-20 text-gray-500">Cargando proveedores...</div>;
  }

  if (!idClub) {
    return <div className="text-center py-20 text-gray-500">Club no encontrado</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Proveedores</h1>
      <p className="text-sm text-gray-500 mb-8">Gestioná los proveedores de insumos y packaging de tu club.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase">Proveedores totales</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{suppliers.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase">Activos</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase">Categorías cubiertas</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{categoriesCovered}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="border border-gray-200 rounded-xl p-5 mb-8 max-w-2xl space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" placeholder="Nombre de la empresa" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="email" placeholder="Mail de contacto" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="text" placeholder="Teléfono" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="text" placeholder="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <textarea placeholder="Notas (opcional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Categorías que provee</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${form.categoryIds.includes(cat.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}
                >
                  {cat.name}
                </button>
              ))}
              {categories.length === 0 && <p className="text-xs text-gray-500">Primero creá categorías en la sección "Categorías de Insumos".</p>}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
              {editingId ? 'Guardar cambios' : 'Agregar proveedor'}
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
          <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="all">Activos e inactivos</option>
            <option value="active">Solo activos</option>
            <option value="inactive">Solo inactivos</option>
          </select>
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="name">Ordenar: Nombre</option>
            <option value="spend">Ordenar: Gasto total</option>
          </select>
        </div>

        <div className="space-y-3">
          {filtered.map((s) => (
            <div key={s.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{s.name}</p>
                  <p className="text-xs text-gray-500">{categoryNames(s.categoryIds)}</p>
                </div>
                <button onClick={() => toggleActive(s)} className={`px-2 py-1 text-xs font-semibold rounded-full ${s.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                  {s.active ? 'Activo' : 'Inactivo'}
                </button>
              </div>
              <div className="text-sm text-gray-600 space-y-1 mb-3">
                {s.contactEmail && <p>Mail: {s.contactEmail}</p>}
                {s.contactPhone && <p>Tel: {s.contactPhone}</p>}
                {s.address && <p>Dirección: {s.address}</p>}
                {s.notes && <p className="text-gray-500 italic">{s.notes}</p>}
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                <span>Insumos que provee: {productsCountBySupplier[s.id] ?? 0}</span>
                <span>Gasto total recibido: ${(spendBySupplier[s.id] ?? 0).toLocaleString('es-AR')}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => loadForEdit(s)} className="text-xs font-medium px-3 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">
                  Editar
                </button>
                <button onClick={() => removeSupplier(s.id)} className="text-xs font-medium px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center py-8 text-gray-500">No hay proveedores para mostrar.</p>}
        </div>
      </div>
    </div>
  );
};

export default InventorySuppliersPage;
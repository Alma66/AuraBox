import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../../api/config';
import { useAuth } from '../../../../App';
import { SupplierItem, SupplyCategory, SupplyOrderItem, ProductInventoryItem } from '../../../../types/inventory';
import toast from 'react-hot-toast';

const emptyForm = {
  name: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  notes: '',
  categoryIds: [] as number[],
};

type SortKey = 'name' | 'spend';

const fieldClass =
  'px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm text-aurora-navy bg-white focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40 focus:border-aurora-terracotta';

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
      toast.error('El nombre del proveedor es obligatorio');
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
      toast.error('Error al guardar el proveedor');
    }
  };

  const removeSupplier = (id: number) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">¿Eliminar este proveedor?</p>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 text-sm border border-aurora-cream/40 rounded-lg hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await api.delete(`/inventory/suppliers/${id}`);
                  fetchAll();
                } catch (err) {
                  console.error(err);
                  toast.error('Error al eliminar el proveedor');
                }
              }}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const toggleActive = async (s: SupplierItem) => {
    try {
      await api.put(`/inventory/suppliers/${s.id}`, { active: !s.active });
      fetchAll();
    } catch (err) {
      console.error(err);
      toast.error('Error al cambiar el estado del proveedor');
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

  const categoryNames = (ids: number[]) =>
    ids.map((id) => categories.find((c) => c.id === id)?.name).filter(Boolean).join(', ') || 'Sin categoría';

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
    return <div className="text-center py-20 text-aurora-navy/60">Cargando proveedores...</div>;
  }

  if (!idClub) {
    return <div className="text-center py-20 text-aurora-navy/60">Club no encontrado</div>;
  }

  return (
    <div className="px-4 py-6 lg:px-8">
      <h1 className="text-2xl font-bold text-aurora-navy mb-2">Proveedores</h1>
      <p className="text-sm text-aurora-navy/60 mb-8">Gestioná los proveedores de insumos y packaging de tu club.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-aurora-navy/10 p-5">
          <p className="text-xs font-semibold text-aurora-navy/60 uppercase">Proveedores totales</p>
          <p className="text-2xl font-bold text-aurora-navy mt-1">{suppliers.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-aurora-navy/10 p-5">
          <p className="text-xs font-semibold text-aurora-navy/60 uppercase">Activos</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-aurora-navy/10 p-5">
          <p className="text-xs font-semibold text-aurora-navy/60 uppercase">Categorías cubiertas</p>
          <p className="text-2xl font-bold text-aurora-navy mt-1">{categoriesCovered}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-6">
        <div className="border border-aurora-navy/10 rounded-xl p-5 mb-8 max-w-2xl space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" placeholder="Nombre de la empresa" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldClass} />
            <input type="email" placeholder="Mail de contacto" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className={fieldClass} />
            <input type="text" placeholder="Teléfono" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className={fieldClass} />
            <input type="text" placeholder="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={fieldClass} />
          </div>
          <textarea placeholder="Notas (opcional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`w-full ${fieldClass}`} rows={2} />
          <div>
            <p className="text-sm font-medium text-aurora-navy/70 mb-2">Categorías que provee</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const selected = form.categoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      selected
                        ? 'bg-aurora-terracotta text-white border-aurora-terracotta'
                        : 'bg-white text-aurora-navy/70 border-aurora-navy/15 hover:border-aurora-terracotta/40'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
              {categories.length === 0 && (
                <p className="text-xs text-aurora-navy/60">Primero creá categorías en la sección "Categorías de Insumos".</p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSubmit} className="px-4 py-2 bg-aurora-terracotta text-white text-sm font-medium rounded-lg hover:bg-aurora-terracottaDark">
              {editingId ? 'Guardar cambios' : 'Agregar proveedor'}
            </button>
            {editingId && (
              <button onClick={resetForm} className="px-4 py-2 bg-aurora-navy/10 text-aurora-navy text-sm font-medium rounded-lg hover:bg-aurora-navy/15">
                Cancelar
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input type="text" placeholder="Buscar por nombre..." value={search} onChange={(e) => setSearch(e.target.value)} className={`${fieldClass} flex-1 min-w-[180px]`} />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={fieldClass}>
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)} className={fieldClass}>
            <option value="all">Activos e inactivos</option>
            <option value="active">Solo activos</option>
            <option value="inactive">Solo inactivos</option>
          </select>
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className={fieldClass}>
            <option value="name">Ordenar: Nombre</option>
            <option value="spend">Ordenar: Gasto total</option>
          </select>
        </div>

        <div className="space-y-3">
          {filtered.map((s) => (
            <div key={s.id} className="border border-aurora-navy/10 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-aurora-navy">{s.name}</p>
                  <p className="text-xs text-aurora-navy/60">{categoryNames(s.categoryIds)}</p>
                </div>
                <button
                  onClick={() => toggleActive(s)}
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    s.active ? 'bg-emerald-100 text-emerald-800' : 'bg-aurora-navy/10 text-aurora-navy/70'
                  }`}
                >
                  {s.active ? 'Activo' : 'Inactivo'}
                </button>
              </div>
              <div className="text-sm text-aurora-navy/70 space-y-1 mb-3">
                {s.contactEmail && <p>Mail: {s.contactEmail}</p>}
                {s.contactPhone && <p>Tel: {s.contactPhone}</p>}
                {s.address && <p>Dirección: {s.address}</p>}
                {s.notes && <p className="text-aurora-navy/60 italic">{s.notes}</p>}
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-aurora-navy/60 mb-3">
                <span>Insumos que provee: {productsCountBySupplier[s.id] ?? 0}</span>
                <span>Gasto total recibido: ${(spendBySupplier[s.id] ?? 0).toLocaleString('es-AR')}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => loadForEdit(s)} className="text-xs font-medium px-3 py-1 rounded bg-aurora-terracotta/10 text-aurora-terracottaDark hover:bg-aurora-terracotta/20">
                  Editar
                </button>
                <button onClick={() => removeSupplier(s.id)} className="text-xs font-medium px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center py-8 text-aurora-navy/60">No hay proveedores para mostrar.</p>}
        </div>
      </div>
    </div>
  );
};

export default InventorySuppliersPage;
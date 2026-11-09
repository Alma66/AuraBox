import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../../../api/config';
import { useAuth } from '../../../../App';
import ConfirmDialog from '../../../../components/admin/ConfirmDialog';
import LoadError from '../../../../components/entrepreneur/LoadError';
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

const fieldClass =
  'px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm text-aurora-navy bg-white focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40 focus:border-aurora-terracotta';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const InventorySuppliersPage: React.FC = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const idClub = user?.managedClubId ? Number(user.managedClubId) : null;

  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [categories, setCategories] = useState<SupplyCategory[]>([]);
  const [orders, setOrders] = useState<SupplyOrderItem[]>([]);
  const [products, setProducts] = useState<ProductInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SupplierItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterActive, setFilterActive] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');

  const fetchAll = useCallback(async () => {
    if (!idClub) return;
    setLoading(true);
    setFailed(false);
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

  const toggleCategory = (id: number) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id) ? prev.categoryIds.filter((x) => x !== id) : [...prev.categoryIds, id],
    }));
  };

  const handleSubmit = async () => {
    if (saving) return;
    const name = form.name.trim();
    const email = form.contactEmail.trim();
    if (!name) {
      toast.error('El nombre del proveedor es obligatorio');
      return;
    }
    if (email && !EMAIL_PATTERN.test(email)) {
      toast.error('El mail de contacto no es válido');
      return;
    }
    const payload = {
      idClub,
      name,
      contactEmail: email || null,
      contactPhone: form.contactPhone.trim() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
      categoryIds: form.categoryIds,
    };
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/inventory/suppliers/${editingId}`, payload);
        toast.success('Proveedor actualizado');
      } else {
        await api.post('/inventory/suppliers', payload);
        toast.success('Proveedor agregado');
      }
      resetForm();
      fetchAll();
    } catch (err: any) {
      const message = err?.response?.data?.message;
      toast.error(typeof message === 'string' ? message : 'No se pudo guardar el proveedor.');
    } finally {
      setSaving(false);
    }
  };

  const confirmRemove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/inventory/suppliers/${deleteTarget.id}`);
      toast.success('Proveedor eliminado');
      if (editingId === deleteTarget.id) resetForm();
      setDeleteTarget(null);
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'No se pudo eliminar el proveedor.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (s: SupplierItem) => {
    if (togglingId !== null) return;
    setTogglingId(s.id);
    try {
      await api.put(`/inventory/suppliers/${s.id}`, { active: !s.active });
      toast.success(s.active ? 'Proveedor desactivado' : 'Proveedor activado');
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'No se pudo cambiar el estado del proveedor.');
    } finally {
      setTogglingId(null);
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

  if (authLoading || (loading && suppliers.length === 0 && !failed)) {
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
    return <LoadError title="No pudimos cargar tus proveedores." onRetry={fetchAll} />;
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

      <div className={`bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-6 transition-opacity ${loading ? 'opacity-60' : ''}`}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
          noValidate
          className="border border-aurora-navy/10 rounded-xl p-5 mb-8 max-w-2xl space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" aria-label="Nombre de la empresa" maxLength={120} placeholder="Nombre de la empresa" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldClass} />
            <input type="email" aria-label="Mail de contacto" maxLength={120} placeholder="Mail de contacto" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className={fieldClass} />
            <input type="tel" aria-label="Teléfono" maxLength={40} placeholder="Teléfono" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className={fieldClass} />
            <input type="text" aria-label="Dirección" maxLength={200} placeholder="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={fieldClass} />
          </div>
          <textarea aria-label="Notas" maxLength={500} placeholder="Notas (opcional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`w-full ${fieldClass}`} rows={2} />
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
            <button type="submit" disabled={saving} className="px-4 py-2 bg-aurora-terracotta text-white text-sm font-medium rounded-lg hover:bg-aurora-terracottaDark disabled:cursor-not-allowed disabled:opacity-60">
              {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Agregar proveedor'}
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
          <select aria-label="Filtrar por estado" value={filterActive} onChange={(e) => setFilterActive(e.target.value)} className={fieldClass}>
            <option value="all">Activos e inactivos</option>
            <option value="active">Solo activos</option>
            <option value="inactive">Solo inactivos</option>
          </select>
          <select aria-label="Ordenar por" value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className={fieldClass}>
            <option value="name">Ordenar: Nombre</option>
            <option value="spend">Ordenar: Gasto total</option>
          </select>
        </div>

        <ul className="space-y-3">
          {filtered.map((s) => (
            <li key={s.id} className="border border-aurora-navy/10 rounded-xl p-4">
              <div className="flex justify-between items-start gap-3 mb-2">
                <div className="min-w-0">
                  <p className="font-semibold text-aurora-navy truncate">{s.name}</p>
                  <p className="text-xs text-aurora-navy/60">{categoryNames(s.categoryIds)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleActive(s)}
                  disabled={togglingId === s.id}
                  aria-label={`${s.active ? 'Desactivar' : 'Activar'} proveedor ${s.name}`}
                  className={`px-2 py-1 text-xs font-semibold rounded-full disabled:opacity-60 ${
                    s.active ? 'bg-emerald-100 text-emerald-800' : 'bg-aurora-navy/10 text-aurora-navy/70'
                  }`}
                >
                  {s.active ? 'Activo' : 'Inactivo'}
                </button>
              </div>
              <div className="text-sm text-aurora-navy/70 space-y-1 mb-3">
                {s.contactEmail && (
                  <p>
                    Mail: <a href={`mailto:${s.contactEmail}`} className="text-aurora-terracottaDark hover:underline">{s.contactEmail}</a>
                  </p>
                )}
                {s.contactPhone && <p>Tel: {s.contactPhone}</p>}
                {s.address && <p>Dirección: {s.address}</p>}
                {s.notes && <p className="text-aurora-navy/60 italic">{s.notes}</p>}
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-aurora-navy/60 mb-3">
                <span>Insumos que provee: {productsCountBySupplier[s.id] ?? 0}</span>
                <span>Gasto total recibido: ${(spendBySupplier[s.id] ?? 0).toLocaleString('es-AR')}</span>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => loadForEdit(s)} aria-label={`Editar proveedor ${s.name}`} className="text-xs font-medium px-3 py-1 rounded bg-aurora-terracotta/10 text-aurora-terracottaDark hover:bg-aurora-terracotta/20">
                  Editar
                </button>
                <button type="button" onClick={() => setDeleteTarget(s)} aria-label={`Eliminar proveedor ${s.name}`} className="text-xs font-medium px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
        {filtered.length === 0 && (
          <p className="text-center py-8 text-aurora-navy/60">
            {suppliers.length === 0 ? 'Todavía no cargaste proveedores.' : 'No hay proveedores que coincidan con los filtros.'}
          </p>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Eliminar proveedor"
          description={`Se va a eliminar "${deleteTarget.name}". Los insumos que lo tenían como proveedor habitual quedan sin proveedor. Si tiene pedidos registrados, desactivalo en lugar de eliminarlo.`}
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

export default InventorySuppliersPage;
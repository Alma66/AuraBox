import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../../../api/config';
import { useAuth } from '../../../../App';
import ConfirmDialog from '../../../../components/admin/ConfirmDialog';
import LoadError from '../../../../components/entrepreneur/LoadError';
import { SupplyCategory, SupplierItem, ProductInventoryItem } from '../../../../types/inventory';

const fieldClass =
  'min-h-[44px] rounded-lg border border-aurora-navy/15 bg-white px-3 text-sm text-aurora-navy focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40 focus:border-aurora-terracotta';

const InventoryCategoriesPage: React.FC = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const idClub = user?.managedClubId ? Number(user.managedClubId) : null;

  const [categories, setCategories] = useState<SupplyCategory[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [products, setProducts] = useState<ProductInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SupplyCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    setName('');
    setDescription('');
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (saving) return;
    const cleanName = name.trim();
    if (!cleanName) {
      toast.error('El nombre de la categoría es obligatorio');
      return;
    }
    const cleanDescription = description.trim();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/inventory/categories/${editingId}`, {
          name: cleanName,
          description: cleanDescription || null,
        });
        toast.success('Categoría actualizada');
      } else {
        await api.post('/inventory/categories', {
          idClub,
          name: cleanName,
          description: cleanDescription || undefined,
        });
        toast.success('Categoría agregada');
      }
      resetForm();
      fetchAll();
    } catch (err: any) {
      const message = err?.response?.data?.message;
      toast.error(typeof message === 'string' ? message : 'No se pudo guardar la categoría.');
    } finally {
      setSaving(false);
    }
  };

  const confirmRemove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/inventory/categories/${deleteTarget.id}`);
      toast.success('Categoría eliminada');
      if (editingId === deleteTarget.id) resetForm();
      setDeleteTarget(null);
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'No se pudo eliminar la categoría.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const loadForEdit = (cat: SupplyCategory) => {
    setName(cat.name);
    setDescription(cat.description ?? '');
    setEditingId(cat.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const productsCount = useCallback(
    (catId: number) => products.filter((p) => p.idSupplyCategory === catId).length,
    [products]
  );
  const suppliersCount = useCallback(
    (catId: number) => suppliers.filter((s) => s.categoryIds.includes(catId)).length,
    [suppliers]
  );

  const filtered = useMemo(() => {
    return categories.filter((c) => !search.trim() || c.name.toLowerCase().includes(search.trim().toLowerCase()));
  }, [categories, search]);

  const topCategory = useMemo(() => {
    if (categories.length === 0) return '—';
    const sorted = [...categories].sort((a, b) => productsCount(b.id) - productsCount(a.id));
    return sorted[0]?.name ?? '—';
  }, [categories, productsCount]);

  if (authLoading || (loading && categories.length === 0 && !failed)) {
    return (
      <div className="animate-pulse space-y-6 px-4 py-6 lg:px-8" aria-busy="true">
        <div className="h-8 w-64 rounded bg-aurora-navy/10" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-24 rounded-xl bg-aurora-navy/10" />
          <div className="h-24 rounded-xl bg-aurora-navy/10" />
        </div>
        <div className="h-64 rounded-xl bg-aurora-navy/10" />
      </div>
    );
  }

  if (!idClub) {
    return <div className="py-20 text-center text-aurora-navy/60">Club no encontrado</div>;
  }

  if (failed) {
    return <LoadError title="No pudimos cargar tus categorías." onRetry={fetchAll} />;
  }

  return (
    <div className="px-4 py-6 lg:px-8">
      <h1 className="mb-2 font-display text-2xl font-bold text-aurora-navy">Categorías de Insumos</h1>
      <p className="mb-8 text-sm text-aurora-navy/60">
        Organizá los insumos y proveedores de tu club por categoría, por ejemplo "Materia Prima", "Packaging" o "Extras".
      </p>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-aurora-navy/10 bg-white p-5">
          <p className="text-xs font-semibold uppercase text-aurora-navy/60">Categorías totales</p>
          <p className="mt-1 text-2xl font-bold text-aurora-navy">{categories.length}</p>
        </div>
        <div className="rounded-xl border border-aurora-navy/10 bg-white p-5">
          <p className="text-xs font-semibold uppercase text-aurora-navy/60">Categoría con más insumos</p>
          <p className="mt-1 truncate text-lg font-bold text-aurora-navy">{topCategory}</p>
        </div>
      </div>

      <div className="rounded-xl border border-aurora-navy/10 bg-white p-6 shadow-aurora-sm">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
          className="mb-6 flex max-w-2xl flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="category-name" className="sr-only">
            Nombre de la categoría
          </label>
          <input
            id="category-name"
            type="text"
            maxLength={80}
            placeholder="Nombre de la categoría"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`flex-1 ${fieldClass}`}
          />
          <label htmlFor="category-description" className="sr-only">
            Descripción
          </label>
          <input
            id="category-description"
            type="text"
            maxLength={200}
            placeholder="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`flex-1 ${fieldClass}`}
          />
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] rounded-lg bg-aurora-terracotta px-4 text-sm font-medium text-white hover:bg-aurora-terracottaDark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Guardando...' : editingId ? 'Guardar' : 'Agregar'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="min-h-[44px] rounded-lg bg-aurora-navy/10 px-4 text-sm font-medium text-aurora-navy hover:bg-aurora-navy/15"
            >
              Cancelar
            </button>
          )}
        </form>

        <label htmlFor="category-search" className="sr-only">
          Buscar por nombre
        </label>
        <input
          id="category-search"
          type="search"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`mb-4 w-full max-w-xs ${fieldClass}`}
        />

        <ul className={`space-y-2 transition-opacity ${loading ? 'opacity-60' : ''}`}>
          {filtered.map((cat) => (
            <li key={cat.id} className="flex items-center justify-between gap-3 rounded-lg border border-aurora-navy/10 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-aurora-navy">{cat.name}</p>
                {cat.description && <p className="truncate text-xs text-aurora-navy/60">{cat.description}</p>}
                <p className="mt-1 text-xs text-aurora-navy/50">
                  {productsCount(cat.id)} insumos · {suppliersCount(cat.id)} proveedores
                </p>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => loadForEdit(cat)}
                  aria-label={`Editar categoría ${cat.name}`}
                  className="min-h-[40px] rounded bg-aurora-terracotta/10 px-3 text-xs font-medium text-aurora-terracottaDark hover:bg-aurora-terracotta/20"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(cat)}
                  aria-label={`Eliminar categoría ${cat.name}`}
                  className="min-h-[40px] rounded bg-red-50 px-3 text-xs font-medium text-red-600 hover:bg-red-100"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
        {filtered.length === 0 && (
          <p className="py-8 text-center text-aurora-navy/60">
            {categories.length === 0 ? 'Todavía no creaste categorías.' : 'Ninguna categoría coincide con tu búsqueda.'}
          </p>
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Eliminar categoría"
          description={`Se va a eliminar "${deleteTarget.name}". Si hay insumos usándola, no se va a poder eliminar.`}
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

export default InventoryCategoriesPage;
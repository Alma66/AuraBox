import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../../api/config';
import { useAuth } from '../../../../App';
import { SupplyCategory, SupplierItem, ProductInventoryItem } from '../../../../types/inventory';
import toast from 'react-hot-toast';

const InventoryCategoriesPage: React.FC = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const idClub = user?.managedClubId ? Number(user.managedClubId) : null;

  const [categories, setCategories] = useState<SupplyCategory[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [products, setProducts] = useState<ProductInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

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
    setName('');
    setDescription('');
    setEditingId(null);
  };

  const handleSubmit = async () => {
  if (!name.trim()) {
    toast.error('El nombre de la categoría es obligatorio');
    return;
  }
  try {
    if (editingId) {
      await api.put(`/inventory/categories/${editingId}`, { name, description: description || undefined });
    } else {
      await api.post('/inventory/categories', { idClub, name, description: description || undefined });
    }
    resetForm();
    fetchAll();
  } catch (err) {
    console.error(err);
    toast.error('Error al guardar la categoría');
  }
};

const removeCategory = (id: number) => {
  toast((t) => (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">¿Eliminar esta categoría?</p>
      <div className="flex gap-2 justify-end">
        <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancelar
        </button>
        <button
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              await api.delete(`/inventory/categories/${id}`);
              fetchAll();
            } catch (err: any) {
              console.error(err);
              toast.error(err?.response?.data?.message ?? 'Error al eliminar la categoría');
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

  if (authLoading || loading) {
    return <div className="text-center py-20 text-gray-500">Cargando categorías...</div>;
  }

  if (!idClub) {
    return <div className="text-center py-20 text-gray-500">Club no encontrado</div>;
  }

  return (
    <div className="px-4 py-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Categorías de Insumos</h1>
      <p className="text-sm text-gray-500 mb-8">Organizá los insumos y proveedores de tu club por categoría, por ejemplo "Materia Prima", "Packaging" o "Extras".</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase">Categorías totales</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{categories.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase">Categoría con más insumos</p>
          <p className="text-lg font-bold text-gray-900 mt-1 truncate">{topCategory}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex gap-3 mb-6 max-w-xl">
          <input
            type="text"
            placeholder="Nombre de la categoría"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="text"
            placeholder="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            {editingId ? 'Guardar' : 'Agregar'}
          </button>
          {editingId && (
            <button onClick={resetForm} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200">
              Cancelar
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4"
        />

        <div className="space-y-2">
          {filtered.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                {cat.description && <p className="text-xs text-gray-500">{cat.description}</p>}
                <p className="text-xs text-gray-400 mt-1">{productsCount(cat.id)} insumos · {suppliersCount(cat.id)} proveedores</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => loadForEdit(cat)} className="text-xs font-medium px-3 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">
                  Editar
                </button>
                <button onClick={() => removeCategory(cat.id)} className="text-xs font-medium px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center py-8 text-gray-500">No hay categorías creadas todavía.</p>}
        </div>
      </div>
    </div>
  );
};

export default InventoryCategoriesPage;
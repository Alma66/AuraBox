import React, { useState } from 'react';
import api from '../../../api/config';
import { SupplierItem, SupplyCategory } from '../../../types/inventory';

interface SuppliersContentProps {
  idClub: number;
  suppliers: SupplierItem[];
  categories: SupplyCategory[];
  onRefresh: () => void;
}

const emptyForm = {
  name: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  notes: '',
  categoryIds: [] as number[],
};

const SuppliersContent: React.FC<SuppliersContentProps> = ({ idClub, suppliers, categories, onRefresh }) => {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');

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
      onRefresh();
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
  };

  const removeSupplier = async (id: number) => {
    if (!window.confirm('¿Eliminar este proveedor?')) return;
    try {
      await api.delete(`/inventory/suppliers/${id}`);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el proveedor');
    }
  };

  const categoryNames = (ids: number[]) => ids.map((id) => categories.find((c) => c.id === id)?.name).filter(Boolean).join(', ') || 'Sin categoría';

  const filtered = filterCategory === 'all' ? suppliers : suppliers.filter((s) => s.categoryIds.includes(Number(filterCategory)));

  return (
    <div className="animate-fadeInUp">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Proveedores</h2>

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
            {categories.length === 0 && <p className="text-xs text-gray-500">Primero creá categorías en la sección "Categorías".</p>}
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

      <div className="mb-4">
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
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
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                {s.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1 mb-3">
              {s.contactEmail && <p>Mail: {s.contactEmail}</p>}
              {s.contactPhone && <p>Tel: {s.contactPhone}</p>}
              {s.address && <p>Dirección: {s.address}</p>}
              {s.notes && <p className="text-gray-500 italic">{s.notes}</p>}
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
  );
};

export default SuppliersContent;
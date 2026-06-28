import React, { useState } from 'react';
import api from '../../../api/config';
import { SupplyCategory } from '../../../types/inventory';

interface SupplyCategoriesContentProps {
  idClub: number;
  categories: SupplyCategory[];
  onRefresh: () => void;
}

const SupplyCategoriesContent: React.FC<SupplyCategoriesContentProps> = ({ idClub, categories, onRefresh }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('El nombre de la categoría es obligatorio');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/inventory/categories/${editingId}`, { name, description: description || undefined });
      } else {
        await api.post('/inventory/categories', { idClub, name, description: description || undefined });
      }
      resetForm();
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Error al guardar la categoría');
    }
  };

  const loadForEdit = (cat: SupplyCategory) => {
    setName(cat.name);
    setDescription(cat.description ?? '');
    setEditingId(cat.id);
  };

  const removeCategory = async (id: number) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    try {
      await api.delete(`/inventory/categories/${id}`);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message ?? 'Error al eliminar la categoría');
    }
  };

  return (
    <div className="animate-fadeInUp">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Categorías de Insumos</h2>
      <p className="text-sm text-gray-500 mb-6">Definí las categorías propias de tu club, por ejemplo "Materia Prima", "Packaging" o "Extras". Cada producto y proveedor se organiza dentro de una categoría.</p>

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

      <div className="space-y-2">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">{cat.name}</p>
              {cat.description && <p className="text-xs text-gray-500">{cat.description}</p>}
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
        {categories.length === 0 && <p className="text-center py-8 text-gray-500">No hay categorías creadas todavía.</p>}
      </div>
    </div>
  );
};

export default SupplyCategoriesContent;
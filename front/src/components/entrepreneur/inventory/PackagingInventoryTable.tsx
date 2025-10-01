import React, { useState } from 'react';
import { Packaging, Supplier, UnitType } from '../../../types/inventory';

interface PackagingInventoryTableProps {
  packaging: Packaging[];
  suppliers: Supplier[];
  onEdit: (item: Packaging) => void;
  onDelete: (itemId: string) => void;
  onAdd: (item: Omit<Packaging, 'id'>) => void;
}

const unitOptions: UnitType[] = ['unidad', 'paquete', 'gramos', 'porción', 'kg', 'litro', 'ml', 'metro', 'cm'];

const PackagingInventoryTable: React.FC<PackagingInventoryTableProps> = ({
  packaging,
  suppliers,
  onEdit,
  onDelete,
  onAdd,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Omit<Packaging, 'id'>>({
    name: '',
    description: '',
    type: 'caja',
    supplierId: suppliers.length > 0 ? suppliers[0].id : '',
    unitType: 'unidad',
    currentStock: 0,
    minStock: 0,
    costPerUnit: 0,
  });

  const handleAddClick = () => setIsAdding(true);

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewItem({
      name: '',
      description: '',
      type: 'caja',
      supplierId: suppliers.length > 0 ? suppliers[0].id : '',
      unitType: 'unidad',
      currentStock: 0,
      minStock: 0,
      costPerUnit: 0,
    });
  };

  const handleSaveAdd = () => {
    if (newItem.name.trim() === '') {
      alert('El nombre es obligatorio');
      return;
    }
    onAdd(newItem);
    handleCancelAdd();
  };

  const getSupplierName = (supplierId: string) => suppliers.find(s => s.id === supplierId)?.name || 'Desconocido';

  return (
    <div className="overflow-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Inventario de Packaging</h2>
      <button
        onClick={handleAddClick}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Agregar Packaging
      </button>

      {isAdding && (
        <div className="mb-6 p-4 border border-gray-300 rounded">
          <h3 className="text-lg font-medium mb-2">Nuevo Packaging</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Nombre"
              value={newItem.name}
              onChange={e => setNewItem({ ...newItem, name: e.target.value })}
              className="border p-2 rounded"
            />
            <select
              value={newItem.type}
              onChange={e => setNewItem({ ...newItem, type: e.target.value as any })}
              className="border p-2 rounded"
            >
              <option value="caja">Caja</option>
              <option value="bolsa">Bolsa</option>
              <option value="etiqueta">Etiqueta</option>
              <option value="relleno">Relleno</option>
              <option value="otro">Otro</option>
            </select>
            <select
              value={newItem.supplierId}
              onChange={e => setNewItem({ ...newItem, supplierId: e.target.value })}
              className="border p-2 rounded"
            >
              {suppliers.map(sup => (
                <option key={sup.id} value={sup.id}>{sup.name}</option>
              ))}
            </select>
            <select
              value={newItem.unitType}
              onChange={e => setNewItem({ ...newItem, unitType: e.target.value as UnitType })}
              className="border p-2 rounded"
            >
              {unitOptions.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Stock Actual"
              value={newItem.currentStock}
              onChange={e => setNewItem({ ...newItem, currentStock: Number(e.target.value) })}
              className="border p-2 rounded"
              min={0}
            />
            <input
              type="number"
              placeholder="Stock Mínimo"
              value={newItem.minStock}
              onChange={e => setNewItem({ ...newItem, minStock: Number(e.target.value) })}
              className="border p-2 rounded"
              min={0}
            />
            <input
              type="number"
              placeholder="Costo por Unidad"
              value={newItem.costPerUnit}
              onChange={e => setNewItem({ ...newItem, costPerUnit: Number(e.target.value) })}
              className="border p-2 rounded"
              min={0}
              step="0.01"
            />
            <input
              type="text"
              placeholder="Descripción"
              value={newItem.description}
              onChange={e => setNewItem({ ...newItem, description: e.target.value })}
              className="border p-2 rounded col-span-1 md:col-span-4"
            />
          </div>
          <div className="mt-4 space-x-2">
            <button
              onClick={handleSaveAdd}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Guardar
            </button>
            <button
              onClick={handleCancelAdd}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <table className="min-w-full divide-y divide-gray-200 table-auto">
        <thead className="bg-gray-50">
          <tr>
            <th className="sticky left-0 bg-gray-50 z-10 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
              Nombre
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
              Tipo
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
              Proveedor
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
              Unidad
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
              Stock Actual
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
              Stock Mínimo
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
              Costo por Unidad
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {packaging.map(item => (
            <tr key={item.id} className={item.currentStock <= item.minStock ? 'bg-red-50' : ''}>
              <td className="sticky left-0 bg-white z-0 px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                {item.name}
              </td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{item.type}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{getSupplierName(item.supplierId)}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{item.unitType}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.currentStock}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.minStock}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.costPerUnit.toFixed(2)}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2">
                <button
                  onClick={() => onEdit(item)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {packaging.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center py-4 text-gray-500">
                No hay elementos de packaging en el inventario.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PackagingInventoryTable;
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getResponseData } from '../../../../api/config';
import { useAuth } from '../../../../App';
import { SupplyOrderItem, ProductInventoryItem, SupplierItem, SupplyOrderStatus } from '../../../../types/inventory';
import toast from 'react-hot-toast';

const STATUS_LABELS: Record<SupplyOrderStatus, string> = {
  Pendiente: 'Pendiente',
  En_Camino: 'En camino',
  Recibido: 'Recibido',
  Cancelado: 'Cancelado',
};

const emptyForm = {
  idSupplier: '',
  idProductInventory: '',
  quantity: '',
  totalCost: '',
  estimatedArrival: '',
  notes: '',
};

const InventoryOrdersPage: React.FC = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const idClub = user?.managedClubId ? Number(user.managedClubId) : null;

  const [orders, setOrders] = useState<SupplyOrderItem[]>([]);
  const [products, setProducts] = useState<ProductInventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [filterProduct, setFilterProduct] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchAll = useCallback(async () => {
    if (!idClub) return;
    setLoading(true);
    try {
      const [ordsRes, prodsRes, supsRes] = await Promise.all([
        api.get(`/inventory/orders/by-club/${idClub}`),
        api.get(`/inventory/products/by-club/${idClub}`),
        api.get(`/inventory/suppliers/by-club/${idClub}`),
      ]);
      setOrders(getResponseData(ordsRes) || []);
      setProducts(getResponseData(prodsRes) || []);
      setSuppliers(getResponseData(supsRes) || []);
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

  const productName = useCallback(
    (id: number) => products.find((p) => p.id === id)?.name ?? `Producto #${id}`,
    [products]
  );
  const supplierName = useCallback(
    (id: number) => suppliers.find((s) => s.id === id)?.name ?? `Proveedor #${id}`,
    [suppliers]
  );

  const createOrder = async () => {
  if (!form.idSupplier || !form.idProductInventory || !form.quantity || !form.totalCost) {
    toast.error('Completá proveedor, producto, cantidad y costo total');
    return;
  }
  try {
    await api.post('/inventory/orders', {
      idClub,
      idSupplier: Number(form.idSupplier),
      idProductInventory: Number(form.idProductInventory),
      quantity: Number(form.quantity),
      totalCost: Number(form.totalCost),
      estimatedArrival: form.estimatedArrival || undefined,
      notes: form.notes || undefined,
    });
    setForm(emptyForm);
    fetchAll();
  } catch (err) {
    console.error(err);
    toast.error('Error al crear el pedido');
  }
};

const updateStatus = async (id: number, status: SupplyOrderStatus) => {
  try {
    await api.put(`/inventory/orders/${id}`, { status });
    fetchAll();
  } catch (err) {
    console.error(err);
    toast.error('Error al actualizar el pedido');
  }
};

const removeOrder = (id: number) => {
  toast((t) => (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">¿Eliminar este pedido?</p>
      <div className="flex gap-2 justify-end">
        <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancelar
        </button>
        <button
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              await api.delete(`/inventory/orders/${id}`);
              fetchAll();
            } catch (err) {
              console.error(err);
              toast.error('Error al eliminar el pedido');
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

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (filterStatus !== 'all' && o.status !== filterStatus) return false;
      if (filterSupplier !== 'all' && String(o.idSupplier) !== filterSupplier) return false;
      if (filterProduct !== 'all' && String(o.idProductInventory) !== filterProduct) return false;
      if (dateFrom && new Date(o.orderDate) < new Date(dateFrom)) return false;
      if (dateTo && new Date(o.orderDate) > new Date(dateTo)) return false;
      return true;
    }).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }, [orders, filterStatus, filterSupplier, filterProduct, dateFrom, dateTo]);

  const statusColor = (status: SupplyOrderStatus) => {
    switch (status) {
      case 'Pendiente': return 'bg-amber-100 text-amber-800';
      case 'En_Camino': return 'bg-blue-100 text-blue-800';
      case 'Recibido': return 'bg-emerald-100 text-emerald-800';
      case 'Cancelado': return 'bg-gray-100 text-gray-600';
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'Pendiente' || o.status === 'En_Camino').length;
  const now = new Date();
  const monthSpend = orders
    .filter((o) => o.status === 'Recibido' && new Date(o.orderDate).getMonth() === now.getMonth() && new Date(o.orderDate).getFullYear() === now.getFullYear())
    .reduce((acc, o) => acc + Number(o.totalCost), 0);
  const mostOrdered = useMemo(() => {
    const counts: Record<number, number> = {};
    orders.forEach((o) => { counts[o.idProductInventory] = (counts[o.idProductInventory] ?? 0) + Number(o.quantity); });
    const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    return topId ? productName(Number(topId)) : '—';
  }, [orders, productName]);

  if (authLoading || loading) {
    return <div className="text-center py-20 text-gray-500">Cargando pedidos...</div>;
  }

  if (!idClub) {
    return <div className="text-center py-20 text-gray-500">Club no encontrado</div>;
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Pedidos a Proveedores</h1>
      <p className="text-sm text-gray-500 mb-8">Registrá y hacé seguimiento de las compras de insumos.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase">Pedidos pendientes / en camino</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase">Gasto recibido este mes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">${monthSpend.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase">Insumo más pedido</p>
          <p className="text-lg font-bold text-gray-900 mt-1 truncate">{mostOrdered}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="border border-gray-200 rounded-xl p-5 mb-8 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={form.idSupplier} onChange={(e) => setForm({ ...form, idSupplier: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Proveedor</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select value={form.idProductInventory} onChange={(e) => setForm({ ...form, idProductInventory: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Producto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input type="number" placeholder="Cantidad" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="number" placeholder="Costo total" value={form.totalCost} onChange={(e) => setForm({ ...form, totalCost: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="date" value={form.estimatedArrival} onChange={(e) => setForm({ ...form, estimatedArrival: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <input type="text" placeholder="Notas (opcional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <button onClick={createOrder} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            Crear pedido
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="all">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="all">Todos los proveedores</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="all">Todos los productos</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>

        <div className="space-y-3">
          {filtered.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{productName(order.idProductInventory)}</p>
                  <p className="text-xs text-gray-500">{supplierName(order.idSupplier)} · Pedido el {new Date(order.orderDate).toLocaleDateString('es-AR')}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor(order.status)}`}>
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                <span>Cantidad: {order.quantity}</span>
                <span>Costo total: ${Number(order.totalCost).toLocaleString('es-AR')}</span>
                {order.estimatedArrival && <span>Llegada estimada: {new Date(order.estimatedArrival).toLocaleDateString('es-AR')}</span>}
                {order.receivedDate && <span>Recibido el: {new Date(order.receivedDate).toLocaleDateString('es-AR')}</span>}
                {order.notes && <span>Notas: {order.notes}</span>}
              </div>
              <div className="flex gap-2">
                {order.status === 'Pendiente' && (
                  <button onClick={() => updateStatus(order.id, 'En_Camino')} className="text-xs font-medium px-3 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">
                    Marcar en camino
                  </button>
                )}
                {order.status !== 'Recibido' && order.status !== 'Cancelado' && (
                  <button onClick={() => updateStatus(order.id, 'Recibido')} className="text-xs font-medium px-3 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                    Marcar recibido
                  </button>
                )}
                {order.status !== 'Cancelado' && order.status !== 'Recibido' && (
                  <button onClick={() => updateStatus(order.id, 'Cancelado')} className="text-xs font-medium px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">
                    Cancelar
                  </button>
                )}
                <button onClick={() => removeOrder(order.id)} className="text-xs font-medium px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center py-8 text-gray-500">No hay pedidos para mostrar.</p>}
        </div>
      </div>
    </div>
  );
};

export default InventoryOrdersPage;
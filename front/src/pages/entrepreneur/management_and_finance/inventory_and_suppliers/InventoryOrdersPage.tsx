import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../../../api/config';
import { useAuth } from '../../../../App';
import ConfirmDialog from '../../../../components/admin/ConfirmDialog';
import LoadError from '../../../../components/entrepreneur/LoadError';
import { SupplyOrderItem, ProductInventoryItem, SupplierItem, SupplyOrderStatus } from '../../../../types/inventory';

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

const MAX_VALUE = 99999999;

const fieldClass =
  'px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm text-aurora-navy bg-white focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40 focus:border-aurora-terracotta';

interface StatusChange {
  order: SupplyOrderItem;
  status: SupplyOrderStatus;
}

const InventoryOrdersPage: React.FC = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const idClub = user?.managedClubId ? Number(user.managedClubId) : null;

  const [orders, setOrders] = useState<SupplyOrderItem[]>([]);
  const [products, setProducts] = useState<ProductInventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [statusChange, setStatusChange] = useState<StatusChange | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SupplyOrderItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [filterProduct, setFilterProduct] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchAll = useCallback(async () => {
    if (!idClub) return;
    setLoading(true);
    setFailed(false);
    try {
      const [ordsRes, prodsRes, supsRes] = await Promise.all([
        api.get(`/inventory/orders/by-club/${idClub}`),
        api.get(`/inventory/products/by-club/${idClub}`),
        api.get(`/inventory/suppliers/by-club/${idClub}`),
      ]);
      setOrders(getResponseData(ordsRes) || []);
      setProducts(getResponseData(prodsRes) || []);
      setSuppliers(getResponseData(supsRes) || []);
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

  const productName = useCallback(
    (id: number) => products.find((p) => p.id === id)?.name ?? `Producto #${id}`,
    [products]
  );
  const supplierName = useCallback(
    (id: number) => suppliers.find((s) => s.id === id)?.name ?? `Proveedor #${id}`,
    [suppliers]
  );

  const createOrder = async () => {
    if (saving) return;
    if (!form.idSupplier || !form.idProductInventory || !form.quantity || form.totalCost === '') {
      toast.error('Completá proveedor, producto, cantidad y costo total');
      return;
    }
    const quantity = Number(form.quantity);
    const totalCost = Number(form.totalCost);
    if (!Number.isFinite(quantity) || quantity <= 0 || quantity > MAX_VALUE) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }
    if (!Number.isFinite(totalCost) || totalCost < 0 || totalCost > MAX_VALUE) {
      toast.error('El costo total no es válido');
      return;
    }
    setSaving(true);
    try {
      await api.post('/inventory/orders', {
        idClub,
        idSupplier: Number(form.idSupplier),
        idProductInventory: Number(form.idProductInventory),
        quantity,
        totalCost,
        estimatedArrival: form.estimatedArrival || undefined,
        notes: form.notes.trim() || undefined,
      });
      setForm(emptyForm);
      toast.success('Pedido creado');
      fetchAll();
    } catch (err: any) {
      const message = err?.response?.data?.message;
      toast.error(typeof message === 'string' ? message : 'No se pudo crear el pedido.');
    } finally {
      setSaving(false);
    }
  };

  const applyStatus = async (order: SupplyOrderItem, status: SupplyOrderStatus) => {
    setBusyId(order.id);
    try {
      await api.put(`/inventory/orders/${order.id}`, { status });
      toast.success(status === 'Recibido' ? 'Pedido recibido. Stock actualizado.' : 'Pedido actualizado');
      setStatusChange(null);
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'No se pudo actualizar el pedido.');
      setStatusChange(null);
      fetchAll();
    } finally {
      setBusyId(null);
    }
  };

  const requestStatus = (order: SupplyOrderItem, status: SupplyOrderStatus) => {
    if (busyId !== null) return;
    if (status === 'En_Camino') {
      applyStatus(order, status);
      return;
    }
    setStatusChange({ order, status });
  };

  const confirmRemove = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/inventory/orders/${deleteTarget.id}`);
      toast.success('Pedido eliminado');
      setDeleteTarget(null);
      fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'No se pudo eliminar el pedido.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const to = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;
    return orders
      .filter((o) => {
        const time = new Date(o.orderDate).getTime();
        if (filterStatus !== 'all' && o.status !== filterStatus) return false;
        if (filterSupplier !== 'all' && String(o.idSupplier) !== filterSupplier) return false;
        if (filterProduct !== 'all' && String(o.idProductInventory) !== filterProduct) return false;
        if (from !== null && time < from) return false;
        if (to !== null && time > to) return false;
        return true;
      })
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  }, [orders, filterStatus, filterSupplier, filterProduct, dateFrom, dateTo]);

  const statusColor = (status: SupplyOrderStatus) => {
    switch (status) {
      case 'Pendiente': return 'bg-amber-100 text-amber-800';
      case 'En_Camino': return 'bg-aurora-terracotta/10 text-aurora-terracottaDark';
      case 'Recibido': return 'bg-emerald-100 text-emerald-800';
      case 'Cancelado': return 'bg-aurora-navy/10 text-aurora-navy/70';
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'Pendiente' || o.status === 'En_Camino').length;
  const now = new Date();
  const monthSpend = orders
    .filter(
      (o) =>
        o.status === 'Recibido' &&
        new Date(o.orderDate).getMonth() === now.getMonth() &&
        new Date(o.orderDate).getFullYear() === now.getFullYear()
    )
    .reduce((acc, o) => acc + Number(o.totalCost), 0);
  const mostOrdered = useMemo(() => {
    const counts: Record<number, number> = {};
    orders.forEach((o) => {
      counts[o.idProductInventory] = (counts[o.idProductInventory] ?? 0) + Number(o.quantity);
    });
    const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    return topId ? productName(Number(topId)) : '—';
  }, [orders, productName]);

  const dialogCopy = (change: StatusChange) => {
    const product = productName(change.order.idProductInventory);
    if (change.status === 'Recibido') {
      return {
        title: 'Marcar pedido como recibido',
        description: `Se van a sumar ${change.order.quantity} unidades al stock de "${product}". Esta acción no se puede deshacer.`,
        confirmLabel: 'Marcar recibido',
        danger: false,
      };
    }
    return {
      title: 'Cancelar pedido',
      description: `El pedido de "${product}" va a quedar cancelado y no va a sumar stock.`,
      confirmLabel: 'Cancelar pedido',
      danger: true,
    };
  };

  if (authLoading || (loading && orders.length === 0 && !failed)) {
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
    return <LoadError title="No pudimos cargar tus pedidos." onRetry={fetchAll} />;
  }

  if (!idClub) {
    return <div className="text-center py-20 text-aurora-navy/60">Club no encontrado</div>;
  }

  return (
    <div className="px-4 py-6 lg:px-8">
      <h1 className="text-2xl font-bold text-aurora-navy mb-2">Pedidos a Proveedores</h1>
      <p className="text-sm text-aurora-navy/60 mb-8">Registrá y hacé seguimiento de las compras de insumos.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-aurora-navy/10 p-5">
          <p className="text-xs font-semibold text-aurora-navy/60 uppercase">Pedidos pendientes / en camino</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-aurora-navy/10 p-5">
          <p className="text-xs font-semibold text-aurora-navy/60 uppercase">Gasto recibido este mes</p>
          <p className="text-2xl font-bold text-aurora-navy mt-1">${monthSpend.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-white rounded-xl border border-aurora-navy/10 p-5">
          <p className="text-xs font-semibold text-aurora-navy/60 uppercase">Insumo más pedido</p>
          <p className="text-lg font-bold text-aurora-navy mt-1 truncate">{mostOrdered}</p>
        </div>
      </div>

      <div className={`bg-white rounded-xl shadow-aurora-sm border border-aurora-navy/10 p-6 transition-opacity ${loading ? 'opacity-60' : ''}`}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            createOrder();
          }}
          noValidate
          className="border border-aurora-navy/10 rounded-xl p-5 mb-8 space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select aria-label="Proveedor" value={form.idSupplier} onChange={(e) => setForm({ ...form, idSupplier: e.target.value })} className={fieldClass}>
              <option value="">Proveedor</option>
              {suppliers.filter((s) => s.active).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select aria-label="Producto" value={form.idProductInventory} onChange={(e) => setForm({ ...form, idProductInventory: e.target.value })} className={fieldClass}>
              <option value="">Producto</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input type="number" min="0.01" step="any" aria-label="Cantidad" placeholder="Cantidad" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className={fieldClass} />
            <input type="number" min="0" step="any" aria-label="Costo total" placeholder="Costo total" value={form.totalCost} onChange={(e) => setForm({ ...form, totalCost: e.target.value })} className={fieldClass} />
            <input type="date" aria-label="Llegada estimada" value={form.estimatedArrival} onChange={(e) => setForm({ ...form, estimatedArrival: e.target.value })} className={fieldClass} />
          </div>
          <input type="text" aria-label="Notas" maxLength={500} placeholder="Notas (opcional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`w-full ${fieldClass}`} />
          <button type="submit" disabled={saving} className="px-4 py-2 bg-aurora-terracotta text-white text-sm font-medium rounded-lg hover:bg-aurora-terracottaDark disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? 'Creando...' : 'Crear pedido'}
          </button>
        </form>

        <div className="flex flex-wrap gap-3 mb-4">
          <select aria-label="Filtrar por estado" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={fieldClass}>
            <option value="all">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select aria-label="Filtrar por proveedor" value={filterSupplier} onChange={(e) => setFilterSupplier(e.target.value)} className={fieldClass}>
            <option value="all">Todos los proveedores</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select aria-label="Filtrar por producto" value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)} className={fieldClass}>
            <option value="all">Todos los productos</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input type="date" aria-label="Desde" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={fieldClass} />
          <input type="date" aria-label="Hasta" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={fieldClass} />
        </div>

        <ul className="space-y-3">
          {filtered.map((order) => (
            <li key={order.id} className="border border-aurora-navy/10 rounded-xl p-4">
              <div className="flex justify-between items-start gap-3 mb-2">
                <div className="min-w-0">
                  <p className="font-semibold text-aurora-navy truncate">{productName(order.idProductInventory)}</p>
                  <p className="text-xs text-aurora-navy/60">
                    {supplierName(order.idSupplier)} · Pedido el {new Date(order.orderDate).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${statusColor(order.status)}`}>
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-aurora-navy/60 mb-3">
                <span>Cantidad: {order.quantity}</span>
                <span>Costo total: ${Number(order.totalCost).toLocaleString('es-AR')}</span>
                {order.estimatedArrival && <span>Llegada estimada: {new Date(order.estimatedArrival).toLocaleDateString('es-AR')}</span>}
                {order.receivedDate && <span>Recibido el: {new Date(order.receivedDate).toLocaleDateString('es-AR')}</span>}
                {order.notes && <span>Notas: {order.notes}</span>}
              </div>
              <div className="flex flex-wrap gap-2">
                {order.status === 'Pendiente' && (
                  <button type="button" disabled={busyId === order.id} onClick={() => requestStatus(order, 'En_Camino')} className="text-xs font-medium px-3 py-1 rounded bg-aurora-terracotta/10 text-aurora-terracottaDark hover:bg-aurora-terracotta/20 disabled:opacity-60">
                    Marcar en camino
                  </button>
                )}
                {order.status !== 'Recibido' && order.status !== 'Cancelado' && (
                  <button type="button" disabled={busyId === order.id} onClick={() => requestStatus(order, 'Recibido')} className="text-xs font-medium px-3 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-60">
                    Marcar recibido
                  </button>
                )}
                {order.status !== 'Cancelado' && order.status !== 'Recibido' && (
                  <button type="button" disabled={busyId === order.id} onClick={() => requestStatus(order, 'Cancelado')} className="text-xs font-medium px-3 py-1 rounded bg-aurora-navy/10 text-aurora-navy hover:bg-aurora-navy/15 disabled:opacity-60">
                    Cancelar
                  </button>
                )}
                <button type="button" onClick={() => setDeleteTarget(order)} aria-label={`Eliminar pedido de ${productName(order.idProductInventory)}`} className="text-xs font-medium px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
        {filtered.length === 0 && (
          <p className="text-center py-8 text-aurora-navy/60">
            {orders.length === 0 ? 'Todavía no registraste pedidos.' : 'No hay pedidos que coincidan con los filtros.'}
          </p>
        )}
      </div>

      {statusChange && (
        <ConfirmDialog
          {...dialogCopy(statusChange)}
          saving={busyId === statusChange.order.id}
          onConfirm={() => applyStatus(statusChange.order, statusChange.status)}
          onCancel={() => setStatusChange(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Eliminar pedido"
          description={
            deleteTarget.status === 'Recibido'
              ? 'Se va a eliminar el registro del pedido. El stock que ya se sumó no se modifica.'
              : 'Se va a eliminar el pedido. Esta acción no se puede deshacer.'
          }
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

export default InventoryOrdersPage;
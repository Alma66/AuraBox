import React, { useEffect, useMemo, useState } from 'react';
import api, { getResponseData } from '../../api/config';
import { Club } from '../../types/club';
import { Promotion, PromotionType } from '../../types/promotion';

interface ManagePromotionsContentProps {
  activeSection: string;
  club: Club;
  onUpdateClub: (updatedClub: Club) => void;
}

interface SubscriptionTypeOption {
  id: number;
  name: string;
}

const TYPE_LABELS: Record<PromotionType, string> = {
  Descuento_Temporal: 'Descuento temporal',
  Combo_Suscripciones: 'Combo de suscripciones',
  Descuento_Por_Cantidad: 'Descuento por cantidad de suscripciones',
  Envio_Gratis: 'Envío gratis',
  Cupon_Proxima: 'Cupón para próxima suscripción',
  Descuento_Primeros_Meses: 'Descuento en primeros meses',
};

const emptyForm = {
  name: '',
  description: '',
  promotionType: 'Descuento_Temporal' as PromotionType,
  discountPercentage: '',
  idSubscriptionTypes: '',
  comboSubscriptionIds: [] as number[],
  minSubscriptionsQty: '',
  freeShipping: false,
  couponCode: '',
  durationMonths: '',
  startDate: '',
  endDate: '',
};

const ManagePromotionsContent: React.FC<ManagePromotionsContentProps> = ({ activeSection, club }) => {
  const idClub = Number(club.id);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [subscriptionTypes, setSubscriptionTypes] = useState<SubscriptionTypeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [promosRes, subsRes] = await Promise.all([
        api.get(`/promotions/by-club/${idClub}`),
        api.get('/subscription-types', { params: { clubId: idClub } }),
      ]);
      setPromotions(getResponseData(promosRes) || []);
      setSubscriptionTypes(getResponseData(subsRes) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [idClub]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.name) {
      alert('El nombre de la promoción es obligatorio');
      return;
    }
    const payload: any = {
      idClub,
      name: form.name,
      description: form.description || undefined,
      promotionType: form.promotionType,
      discountPercentage: form.discountPercentage ? Number(form.discountPercentage) : undefined,
      idSubscriptionTypes: form.idSubscriptionTypes ? Number(form.idSubscriptionTypes) : undefined,
      comboSubscriptionIds: form.comboSubscriptionIds.length > 0 ? form.comboSubscriptionIds.join(',') : undefined,
      minSubscriptionsQty: form.minSubscriptionsQty ? Number(form.minSubscriptionsQty) : undefined,
      freeShipping: form.freeShipping,
      couponCode: form.couponCode || undefined,
      durationMonths: form.durationMonths ? Number(form.durationMonths) : undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };
    try {
      if (editingId) {
        await api.put(`/promotions/${editingId}`, payload);
      } else {
        await api.post('/promotions', payload);
      }
      resetForm();
      await fetchData();
      alert('Promoción guardada correctamente');
    } catch (err) {
      console.error(err);
      alert('Error al guardar la promoción');
    }
  };

  const loadForEdit = (promo: Promotion) => {
    setForm({
      name: promo.name,
      description: promo.description ?? '',
      promotionType: promo.promotionType,
      discountPercentage: promo.discountPercentage ?? '',
      idSubscriptionTypes: promo.idSubscriptionTypes ? String(promo.idSubscriptionTypes) : '',
      comboSubscriptionIds: promo.comboSubscriptionIds ? promo.comboSubscriptionIds.split(',').map(Number) : [],
      minSubscriptionsQty: promo.minSubscriptionsQty ? String(promo.minSubscriptionsQty) : '',
      freeShipping: promo.freeShipping,
      couponCode: promo.couponCode ?? '',
      durationMonths: promo.durationMonths ? String(promo.durationMonths) : '',
      startDate: promo.startDate ? promo.startDate.slice(0, 10) : '',
      endDate: promo.endDate ? promo.endDate.slice(0, 10) : '',
    });
    setEditingId(promo.id);
  };

  const toggleActive = async (promo: Promotion) => {
    try {
      await api.patch(`/promotions/${promo.id}/toggle`, { active: !promo.active });
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Error al cambiar el estado de la promoción');
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('¿Eliminar esta promoción permanentemente?')) return;
    try {
      await api.delete(`/promotions/${id}`);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar la promoción');
    }
  };

  const filteredPromotions = useMemo(() => {
    return promotions.filter((p) => {
      if (filterType !== 'all' && p.promotionType !== filterType) return false;
      if (filterActive === 'active' && !p.active) return false;
      if (filterActive === 'inactive' && p.active) return false;
      return true;
    });
  }, [promotions, filterType, filterActive]);

  const subscriptionName = (id?: number | null) => subscriptionTypes.find((s) => s.id === id)?.name ?? '—';

  const toggleComboId = (id: number) => {
    setForm((prev) => ({
      ...prev,
      comboSubscriptionIds: prev.comboSubscriptionIds.includes(id)
        ? prev.comboSubscriptionIds.filter((x) => x !== id)
        : [...prev.comboSubscriptionIds, id],
    }));
  };

  if (loading) return <div className="text-center py-16 text-gray-500">Cargando promociones...</div>;

  if (activeSection === 'nueva') {
    return (
      <div className="animate-fadeInUp">
        <h2 className="text-xl font-bold text-gray-900 mb-6">{editingId ? 'Editar Promoción' : 'Crear Promoción'}</h2>
        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de promoción</label>
            <select value={form.promotionType} onChange={(e) => setForm({ ...form, promotionType: e.target.value as PromotionType })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {form.promotionType === 'Descuento_Temporal' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suscripción aplicable</label>
                <select value={form.idSubscriptionTypes} onChange={(e) => setForm({ ...form, idSubscriptionTypes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Todas las suscripciones</option>
                  {subscriptionTypes.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descuento (%)</label>
                <input type="number" min={0} max={100} value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </>
          )}

          {form.promotionType === 'Combo_Suscripciones' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suscripciones incluidas en el combo</label>
                <div className="flex flex-wrap gap-2">
                  {subscriptionTypes.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleComboId(s.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${form.comboSubscriptionIds.includes(s.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descuento (%)</label>
                <input type="number" min={0} max={100} value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </>
          )}

          {form.promotionType === 'Descuento_Por_Cantidad' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad mínima de suscripciones</label>
                <input type="number" min={2} value={form.minSubscriptionsQty} onChange={(e) => setForm({ ...form, minSubscriptionsQty: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descuento (%)</label>
                <input type="number" min={0} max={100} value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </>
          )}

          {form.promotionType === 'Envio_Gratis' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Suscripción aplicable</label>
              <select value={form.idSubscriptionTypes} onChange={(e) => setForm({ ...form, idSubscriptionTypes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">Todas las suscripciones</option>
                {subscriptionTypes.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {form.promotionType === 'Cupon_Proxima' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suscripción que activa el cupón</label>
                <select value={form.idSubscriptionTypes} onChange={(e) => setForm({ ...form, idSubscriptionTypes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Cualquier suscripción</option>
                  {subscriptionTypes.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código del cupón</label>
                <input type="text" value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descuento del cupón (%)</label>
                <input type="number" min={0} max={100} value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </>
          )}

          {form.promotionType === 'Descuento_Primeros_Meses' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suscripción aplicable</label>
                <select value={form.idSubscriptionTypes} onChange={(e) => setForm({ ...form, idSubscriptionTypes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Todas las suscripciones</option>
                  {subscriptionTypes.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad de meses</label>
                  <input type="number" min={1} value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descuento (%)</label>
                  <input type="number" min={0} max={100} value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
            </>
          )}

          <label className="flex items-center text-sm text-gray-700">
            <input type="checkbox" checked={form.freeShipping} onChange={(e) => setForm({ ...form, freeShipping: e.target.checked })} className="mr-2" />
            Incluir envío gratis en esta promoción
          </label>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de fin</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSubmit} className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              {editingId ? 'Guardar cambios' : 'Crear promoción'}
            </button>
            {editingId && (
              <button onClick={resetForm} className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeInUp">
      <h2 className="text-xl font-bold text-gray-900 mb-6">{activeSection === 'historial' ? 'Historial de Promociones' : 'Promociones Activas'}</h2>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="all">Todos los tipos</option>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {activeSection === 'historial' && (
          <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="all">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </select>
        )}
      </div>

      <div className="space-y-4">
        {filteredPromotions
          .filter((p) => (activeSection === 'activas' ? p.active : true))
          .map((promo) => (
            <div key={promo.id} className="border border-gray-200 rounded-xl p-5 bg-white">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{promo.name}</h3>
                  <p className="text-xs text-gray-500">{TYPE_LABELS[promo.promotionType]}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${promo.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                  {promo.active ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              {promo.description && <p className="text-sm text-gray-600 mb-2">{promo.description}</p>}
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                {promo.discountPercentage && <span>Descuento: {promo.discountPercentage}%</span>}
                {promo.idSubscriptionTypes && <span>Suscripción: {subscriptionName(promo.idSubscriptionTypes)}</span>}
                {promo.comboSubscriptionIds && <span>Combo: {promo.comboSubscriptionIds.split(',').map((id) => subscriptionName(Number(id))).join(' + ')}</span>}
                {promo.minSubscriptionsQty && <span>Mínimo: {promo.minSubscriptionsQty} suscripciones</span>}
                {promo.freeShipping && <span>Envío gratis</span>}
                {promo.couponCode && <span>Cupón: {promo.couponCode}</span>}
                {promo.durationMonths && <span>Duración: {promo.durationMonths} meses</span>}
                {promo.startDate && <span>Desde: {new Date(promo.startDate).toLocaleDateString('es-AR')}</span>}
                {promo.endDate && <span>Hasta: {new Date(promo.endDate).toLocaleDateString('es-AR')}</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleActive(promo)} className="text-xs font-medium px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">
                  {promo.active ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => loadForEdit(promo)} className="text-xs font-medium px-3 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">
                  Editar
                </button>
                <button onClick={() => remove(promo.id)} className="text-xs font-medium px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        {filteredPromotions.length === 0 && (
          <div className="text-center py-16 text-gray-500">No hay promociones para mostrar.</div>
        )}
      </div>
    </div>
  );
};

export default ManagePromotionsContent;
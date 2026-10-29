import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../api/config';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

type AccountType = 'customer' | 'entrepreneur';

interface Account {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  registrationDate: string;
  club: { id: number; name: string; clubStatus: string } | null;
}

const TABS: { id: AccountType; label: string }[] = [
  { id: 'customer', label: 'Clientes' },
  { id: 'entrepreneur', label: 'Emprendedores' },
];

const CLUB_STATUS_LABEL: Record<string, string> = {
  PENDIENTE_APROBACION: 'Pendiente',
  APROBADO: 'Aprobado',
  SUSPENDIDO: 'Suspendido',
  INACTIVO: 'Inactivo',
};

const AdminUsersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const type: AccountType = searchParams.get('type') === 'entrepreneur' ? 'entrepreneur' : 'customer';
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [target, setTarget] = useState<Account | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await api.get('/admin/accounts', { params: { type, ...(query ? { search: query } : {}) } });
      setAccounts(getResponseData(res) || []);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [type, query]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmToggle = async () => {
    if (!target) return;
    setSaving(true);
    try {
      await api.patch(`/admin/accounts/${type}/${target.id}/active`, { active: !target.active });
      toast.success(target.active ? 'Cuenta desactivada.' : 'Cuenta activada.');
      setTarget(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'No se pudo cambiar el estado de la cuenta.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 px-4 py-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="tablist" aria-label="Tipo de cuenta" className="inline-flex gap-1 self-start rounded-xl bg-aurora-navy/5 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={type === tab.id}
              onClick={() => setSearchParams({ type: tab.id }, { replace: true })}
              className={`min-h-[44px] whitespace-nowrap rounded-lg px-4 text-sm font-semibold transition-colors ${
                type === tab.id ? 'bg-aurora-navy text-white' : 'text-aurora-navy/70 hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="sm:w-80">
          <label htmlFor="account-search" className="sr-only">
            Buscar por nombre o email
          </label>
          <input
            id="account-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o email"
            className="min-h-[44px] w-full rounded-lg border border-aurora-navy/15 bg-white px-3 text-sm text-aurora-navy focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40"
          />
        </div>
      </div>

      {loading && accounts.length === 0 && (
        <div className="animate-pulse space-y-3" aria-busy="true">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-20 rounded-2xl bg-aurora-navy/10" />
          ))}
        </div>
      )}

      {failed && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p>No se pudieron cargar las cuentas.</p>
          <button
            type="button"
            onClick={load}
            className="mt-3 min-h-[44px] rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {!failed && !loading && accounts.length === 0 && (
        <div className="rounded-2xl border border-aurora-navy/10 bg-white px-6 py-16 text-center text-sm text-aurora-navy/55">
          No se encontraron cuentas.
        </div>
      )}

      {!failed && accounts.length > 0 && (
        <ul className={`space-y-3 transition-opacity ${loading ? 'opacity-60' : ''}`}>
          {accounts.map((account) => (
            <li
              key={account.id}
              className="flex flex-col gap-3 rounded-2xl border border-aurora-navy/10 bg-white p-4 shadow-aurora-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-aurora-navy">
                    {account.firstName} {account.lastName}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      account.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {account.active ? 'Activa' : 'Desactivada'}
                  </span>
                </div>
                <p className="truncate text-sm text-aurora-navy/60">{account.email}</p>
                <p className="text-xs text-aurora-navy/50">
                  Alta {new Date(account.registrationDate).toLocaleDateString('es-AR')}
                  {type === 'entrepreneur' &&
                    (account.club
                      ? ` · ${account.club.name} (${CLUB_STATUS_LABEL[account.club.clubStatus] ?? account.club.clubStatus})`
                      : ' · Sin club')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTarget(account)}
                className={`min-h-[44px] rounded-lg px-4 text-sm font-semibold text-white transition-colors ${
                  account.active ? 'bg-red-600 hover:bg-red-700' : 'bg-aurora-terracotta hover:bg-aurora-terracottaDark'
                }`}
              >
                {account.active ? 'Desactivar' : 'Activar'}
              </button>
            </li>
          ))}
        </ul>
      )}

      {target && (
        <ConfirmDialog
          title={`${target.active ? 'Desactivar' : 'Activar'} cuenta`}
          description={
            target.active
              ? `${target.firstName} ${target.lastName} no va a poder iniciar sesión hasta que la reactives.`
              : `${target.firstName} ${target.lastName} va a poder volver a iniciar sesión.`
          }
          confirmLabel={target.active ? 'Desactivar' : 'Activar'}
          danger={target.active}
          saving={saving}
          onConfirm={confirmToggle}
          onCancel={() => setTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;
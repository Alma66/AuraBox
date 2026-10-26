import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../../api/config';
import { TeamUser } from '../../../types/financial';
import Icon from '../layout/Icon';

const roleLabel = (role: string) => role.replace(/_/g, ' ');

const roleClass = (role: string) => {
  if (role === 'administrador_del_club') return 'bg-aurora-navy/10 text-aurora-navy';
  if (role === 'delivery_rider') return 'bg-green-100 text-green-800';
  if (role.includes('moderador')) return 'bg-aurora-gold/20 text-aurora-terracottaDark';
  return 'bg-gray-100 text-gray-700';
};

const controlClass =
  'min-h-[44px] rounded-lg border border-aurora-navy/15 bg-white px-3 text-sm text-aurora-navy focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40';

const TeamTab: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [role, setRole] = useState('all');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!clubId) return;
    setLoading(true);
    setFailed(false);
    try {
      const res = await api.get(`/clubs/${clubId}/team-users`);
      setUsers(getResponseData(res) || []);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    load();
  }, [load]);

  const roles = useMemo(() => Array.from(new Set(users.map((u) => u.role))), [users]);

  const list = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      if (status !== 'all' && u.status !== status) return false;
      if (role !== 'all' && u.role !== role) return false;
      if (term && !u.name.toLowerCase().includes(term) && !u.email.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [users, search, status, role]);

  const remove = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/clubs/${clubId}/team-users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setConfirmId(null);
      toast.success('Usuario eliminado correctamente.');
    } catch {
      toast.error('Error al eliminar el usuario.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3" aria-busy="true">
        <div className="h-11 rounded-xl bg-aurora-navy/10" />
        <div className="h-40 rounded-2xl bg-aurora-navy/10" />
      </div>
    );
  }

  if (failed) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        <p>No se pudo cargar el equipo del club.</p>
        <button
          type="button"
          onClick={load}
          className="mt-3 min-h-[44px] rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-aurora-navy/10 bg-white p-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-aurora-navy/35" />
          <label htmlFor="team-search" className="sr-only">
            Buscar en el equipo
          </label>
          <input
            id="team-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className={`${controlClass} w-full pl-9`}
          />
        </div>
        <label htmlFor="team-status" className="sr-only">
          Estado
        </label>
        <select id="team-status" value={status} onChange={(e) => setStatus(e.target.value)} className={controlClass}>
          <option value="all">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
        <label htmlFor="team-role" className="sr-only">
          Rol
        </label>
        <select id="team-role" value={role} onChange={(e) => setRole(e.target.value)} className={controlClass}>
          <option value="all">Todos los roles</option>
          {roles.map((item) => (
            <option key={item} value={item}>
              {roleLabel(item)}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled
          title="Función en desarrollo"
          className="flex min-h-[44px] cursor-not-allowed items-center gap-2 rounded-lg bg-aurora-navy/10 px-4 text-sm text-aurora-navy/50"
        >
          Agregar miembro
          <span className="rounded-full bg-aurora-gold/20 px-2 py-0.5 text-xs font-semibold text-aurora-terracottaDark">
            Próximamente
          </span>
        </button>
      </div>

      <p className="text-sm text-aurora-navy/55" aria-live="polite">
        {users.length} miembro{users.length !== 1 ? 's' : ''} en total · {list.length} mostrado{list.length !== 1 ? 's' : ''}
      </p>

      {list.length === 0 ? (
        <div className="rounded-xl border border-aurora-navy/10 bg-white px-6 py-14 text-center text-sm text-aurora-navy/55">
          No hay usuarios que coincidan con los filtros.
        </div>
      ) : (
        <ul className="divide-y divide-aurora-navy/10 overflow-hidden rounded-xl border border-aurora-navy/10 bg-white shadow-aurora-sm">
          {list.map((member) => (
            <li key={member.id} className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-aurora-navy">{member.name}</p>
                <p className="truncate text-xs text-aurora-navy/55">{member.email}</p>
                <p className="mt-1 text-xs text-aurora-navy/45">
                  Asignado el {new Date(member.assignedDate).toLocaleDateString('es-AR')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${roleClass(member.role)}`}>
                  {roleLabel(member.role)}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${
                    member.status === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
                >
                  {member.status}
                </span>
                {confirmId === member.id ? (
                  <span className="flex items-center gap-2 text-sm">
                    <span className="text-aurora-navy/70">¿Eliminar?</span>
                    <button
                      type="button"
                      onClick={() => remove(member.id)}
                      disabled={deletingId === member.id}
                      className="min-h-[44px] rounded-lg bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {deletingId === member.id ? 'Eliminando...' : 'Sí'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      className="min-h-[44px] px-2 text-sm font-semibold text-aurora-navy/60"
                    >
                      No
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(member.id)}
                    className="min-h-[44px] px-2 text-sm font-semibold text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TeamTab;
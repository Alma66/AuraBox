import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../App';
import api, { getResponseData } from '../../api/config';

interface AdminAccount {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  documentType: string;
  documentNumber: number;
  phoneNumber: number | null;
  active: boolean;
  notes: string | null;
  createdAt: string;
}

interface NewAdminForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  documentType: string;
  documentNumber: string;
  phoneNumber: string;
  notes: string;
}

const DOCUMENT_TYPES = ['DNI', 'Pasaporte', 'LC', 'LE'];

const EMPTY_FORM: NewAdminForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  documentType: 'DNI',
  documentNumber: '',
  phoneNumber: '',
  notes: '',
};

const INPUT_CLASS =
  'min-h-[44px] w-full rounded-lg border border-aurora-navy/20 bg-white px-3 text-sm text-aurora-navy focus:border-aurora-terracotta focus:ring-aurora-terracotta';

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('es-AR');

const errorMessage = (error: unknown, fallback: string) => {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
  if (Array.isArray(message)) return message.join('. ');
  return message || fallback;
};

const AdminAdminsPage: React.FC = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewAdminForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [passwordId, setPasswordId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admins');
      setAdmins(getResponseData(response) || []);
    } catch {
      setError('No se pudieron cargar los administradores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateField = (field: keyof NewAdminForm) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    setNotice('');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setFormError('Completá nombre y apellido.');
      return;
    }
    if (!/^\d{6,9}$/.test(form.documentNumber)) {
      setFormError('El documento debe tener entre 6 y 9 dígitos, sin puntos.');
      return;
    }
    if (form.phoneNumber && !/^\d{1,9}$/.test(form.phoneNumber)) {
      setFormError('El teléfono debe tener hasta 9 dígitos, sin espacios ni guiones.');
      return;
    }
    if (form.password.length < 8) {
      setFormError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/admins', {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        documentType: form.documentType,
        documentNumber: Number(form.documentNumber),
        ...(form.phoneNumber ? { phoneNumber: Number(form.phoneNumber) } : {}),
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      setNotice('Administrador creado. Compartile la contraseña por un canal seguro.');
      await load();
    } catch (err) {
      setFormError(errorMessage(err, 'No se pudo crear el administrador.'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (admin: AdminAccount) => {
    setBusyId(admin.id);
    setError('');
    setNotice('');
    try {
      await api.patch(`/admins/${admin.id}/active`, { active: !admin.active });
      setConfirmingId(null);
      await load();
    } catch (err) {
      setConfirmingId(null);
      setError(errorMessage(err, 'No se pudo cambiar el estado.'));
    } finally {
      setBusyId(null);
    }
  };

  const handleSetPassword = async (admin: AdminAccount) => {
    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setBusyId(admin.id);
    setError('');
    setNotice('');
    try {
      await api.patch(`/admins/${admin.id}/password`, { password: newPassword });
      setPasswordId(null);
      setNewPassword('');
      setNotice(`Contraseña de ${admin.firstName} actualizada.`);
    } catch (err) {
      setError(errorMessage(err, 'No se pudo actualizar la contraseña.'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-aurora-navy">Administradores</h1>
          <p className="text-sm text-aurora-navy/60">Quién puede gestionar la plataforma.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm((current) => !current);
            setFormError('');
          }}
          className="min-h-[44px] rounded-lg bg-aurora-terracotta px-5 text-sm font-semibold text-white hover:bg-aurora-terracottaDark"
        >
          {showForm ? 'Cancelar' : 'Nuevo administrador'}
        </button>
      </div>

      {notice && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{notice}</div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="mb-8 rounded-2xl border border-aurora-navy/5 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-display text-lg font-bold text-aurora-navy">Nuevo administrador</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="admin-first" className="mb-1 block text-xs font-semibold text-aurora-navy/60">Nombre</label>
              <input id="admin-first" value={form.firstName} onChange={updateField('firstName')} maxLength={80} required className={INPUT_CLASS} />
            </div>
            <div>
              <label htmlFor="admin-last" className="mb-1 block text-xs font-semibold text-aurora-navy/60">Apellido</label>
              <input id="admin-last" value={form.lastName} onChange={updateField('lastName')} maxLength={80} required className={INPUT_CLASS} />
            </div>
            <div>
              <label htmlFor="admin-email" className="mb-1 block text-xs font-semibold text-aurora-navy/60">Email</label>
              <input id="admin-email" type="email" value={form.email} onChange={updateField('email')} maxLength={150} required className={INPUT_CLASS} />
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-1 block text-xs font-semibold text-aurora-navy/60">Contraseña inicial</label>
              <input id="admin-password" type="password" autoComplete="new-password" value={form.password} onChange={updateField('password')} minLength={8} maxLength={72} required className={INPUT_CLASS} />
            </div>
            <div>
              <label htmlFor="admin-doc-type" className="mb-1 block text-xs font-semibold text-aurora-navy/60">Tipo de documento</label>
              <select id="admin-doc-type" value={form.documentType} onChange={updateField('documentType')} className={INPUT_CLASS}>
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="admin-doc" className="mb-1 block text-xs font-semibold text-aurora-navy/60">Número de documento</label>
              <input id="admin-doc" inputMode="numeric" value={form.documentNumber} onChange={updateField('documentNumber')} required className={INPUT_CLASS} />
            </div>
            <div>
              <label htmlFor="admin-phone" className="mb-1 block text-xs font-semibold text-aurora-navy/60">Teléfono (opcional)</label>
              <input id="admin-phone" inputMode="numeric" value={form.phoneNumber} onChange={updateField('phoneNumber')} className={INPUT_CLASS} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="admin-notes" className="mb-1 block text-xs font-semibold text-aurora-navy/60">Notas internas (opcional)</label>
              <textarea id="admin-notes" value={form.notes} onChange={updateField('notes')} maxLength={500} rows={2} className="w-full rounded-lg border border-aurora-navy/20 bg-white px-3 py-2 text-sm text-aurora-navy focus:border-aurora-terracotta focus:ring-aurora-terracotta" />
            </div>
          </div>
          {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}
          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] rounded-lg bg-aurora-terracotta px-6 text-sm font-semibold text-white hover:bg-aurora-terracottaDark disabled:opacity-50"
            >
              {saving ? 'Creando...' : 'Crear administrador'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-aurora-terracottaDark" />
          <p className="text-aurora-navy/70">Cargando administradores...</p>
        </div>
      ) : admins.length === 0 ? (
        <div className="rounded-2xl bg-white py-10 text-center text-sm text-aurora-navy/60 shadow-sm">No hay administradores.</div>
      ) : (
        <div className="space-y-3">
          {admins.map((admin) => {
            const isSelf = user?.id === admin.id;
            const isBusy = busyId === admin.id;
            const isConfirming = confirmingId === admin.id;
            const isChangingPassword = passwordId === admin.id;

            return (
              <div key={admin.id} className="rounded-2xl border border-aurora-navy/5 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-aurora-navy">
                      {admin.firstName} {admin.lastName}
                      {isSelf && <span className="ml-2 text-xs font-medium text-aurora-navy/50">(vos)</span>}
                    </p>
                    <p className="truncate text-sm text-aurora-navy/70">{admin.email}</p>
                    <p className="mt-1 text-xs text-aurora-navy/50">
                      {admin.documentType} {admin.documentNumber} · Alta {formatDate(admin.createdAt)}
                    </p>
                    {admin.notes && <p className="mt-1 text-xs text-aurora-navy/60">{admin.notes}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        admin.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {admin.active ? 'Activo' : 'Inactivo'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordId(isChangingPassword ? null : admin.id);
                        setNewPassword('');
                        setConfirmingId(null);
                      }}
                      className="min-h-[44px] rounded-lg border border-aurora-navy/20 px-3 text-sm font-semibold text-aurora-navy/70 hover:bg-aurora-cream"
                    >
                      Cambiar contraseña
                    </button>
                    {isConfirming ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(admin)}
                          disabled={isBusy}
                          className="min-h-[44px] rounded-lg bg-red-600 px-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {isBusy ? 'Guardando...' : 'Confirmar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          className="min-h-[44px] rounded-lg border border-aurora-navy/20 px-3 text-sm font-semibold text-aurora-navy/70 hover:bg-aurora-cream"
                        >
                          Volver
                        </button>
                      </>
                    ) : admin.active ? (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmingId(admin.id);
                          setPasswordId(null);
                        }}
                        disabled={isSelf}
                        title={isSelf ? 'No podés desactivar tu propia cuenta' : undefined}
                        className="min-h-[44px] rounded-lg border border-red-200 px-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleActive(admin)}
                        disabled={isBusy}
                        className="min-h-[44px] rounded-lg border border-green-200 px-3 text-sm font-semibold text-green-700 hover:bg-green-50 disabled:opacity-50"
                      >
                        {isBusy ? 'Guardando...' : 'Reactivar'}
                      </button>
                    )}
                  </div>
                </div>

                {isChangingPassword && (
                  <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl bg-aurora-cream p-3">
                    <div className="min-w-[220px] flex-1">
                      <label htmlFor={`password-${admin.id}`} className="mb-1 block text-xs font-semibold text-aurora-navy/60">
                        Nueva contraseña
                      </label>
                      <input
                        id={`password-${admin.id}`}
                        type="password"
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        minLength={8}
                        maxLength={72}
                        className={INPUT_CLASS}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSetPassword(admin)}
                      disabled={isBusy}
                      className="min-h-[44px] rounded-lg bg-aurora-terracotta px-4 text-sm font-semibold text-white hover:bg-aurora-terracottaDark disabled:opacity-50"
                    >
                      {isBusy ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminAdminsPage;
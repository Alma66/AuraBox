import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { getResponseData } from '../../api/config';
import { Club } from '../../types/club';

interface SendNewsletterContentProps {
  activeSection: string;
  club: Club;
}

interface Draft {
  id: string;
  subject: string;
  content: string;
  createdAt: string;
}

interface NewsletterSendRecord {
  id: number;
  subject: string;
  content: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  status: 'Enviando' | 'Completado' | 'Con_Errores';
  createdAt: string;
  completedAt: string | null;
  truncatedByDailyLimit?: boolean;
  totalEligibleSubscribers?: number;
}

const TEMPLATES = [
  { id: 'tpl-1', name: 'Bienvenida', subject: '¡Bienvenido a {club}!', content: 'Gracias por unirte a nuestra comunidad. Tu primera caja está en camino.' },
  { id: 'tpl-2', name: 'Promoción mensual', subject: 'Oferta especial este mes en {club}', content: 'Tenemos un descuento especial este mes. ¡No te lo pierdas!' },
  { id: 'tpl-3', name: 'Aviso de envío', subject: 'Tu caja de {club} ya salió', content: 'Tu pedido de este mes ya está en camino. Pronto la recibirás en tu domicilio.' },
];

const DRAFTS_STORAGE_KEY_PREFIX = 'aurabox-newsletter-drafts-';

const STATUS_LABELS: Record<NewsletterSendRecord['status'], string> = {
  Enviando: 'Enviando',
  Completado: 'Completado',
  Con_Errores: 'Con errores',
};

const STATUS_COLORS: Record<NewsletterSendRecord['status'], string> = {
  Enviando: 'bg-aurora-gold/15 text-aurora-navy',
  Completado: 'bg-emerald-100 text-emerald-800',
  Con_Errores: 'bg-red-100 text-red-700',
};

const SendNewsletterContent: React.FC<SendNewsletterContentProps> = ({ activeSection, club }) => {
  const idClub = Number(club.id);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [sending, setSending] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [history, setHistory] = useState<NewsletterSendRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const draftsKey = `${DRAFTS_STORAGE_KEY_PREFIX}${idClub}`;

  useEffect(() => {
    const storedDrafts = localStorage.getItem(draftsKey);
    setDrafts(storedDrafts ? JSON.parse(storedDrafts) : []);
  }, [draftsKey]);

  useEffect(() => {
    if (activeSection !== 'nuevo') return;
    const fetchSubscribers = async () => {
      setLoadingSubscribers(true);
      try {
        const res = await api.get(`/users/newsletter-subscribers/${idClub}`);
        setSubscriberCount((getResponseData(res) || []).length);
      } catch (err) {
        console.error(err);
        setSubscriberCount(0);
      } finally {
        setLoadingSubscribers(false);
      }
    };
    fetchSubscribers();
  }, [activeSection, idClub]);

  useEffect(() => {
    if (activeSection !== 'historial') return;
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await api.get(`/newsletter/history/${idClub}`);
        setHistory(getResponseData(res) || []);
      } catch (err) {
        console.error(err);
        toast.error('No se pudo cargar el historial de envíos');
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [activeSection, idClub]);

  const persistDrafts = (next: Draft[]) => {
    setDrafts(next);
    localStorage.setItem(draftsKey, JSON.stringify(next));
  };

  const saveDraft = () => {
    if (!subject && !content) return;
    const draft: Draft = { id: `draft-${Date.now()}`, subject, content, createdAt: new Date().toISOString() };
    persistDrafts([draft, ...drafts]);
    setSubject('');
    setContent('');
    toast.success('Guardado como borrador');
  };

  const removeDraft = (id: string) => {
    persistDrafts(drafts.filter((d) => d.id !== id));
  };

  const loadDraft = (draft: Draft) => {
    setSubject(draft.subject);
    setContent(draft.content);
  };

  const applyTemplate = (tpl: typeof TEMPLATES[number]) => {
    setSubject(tpl.subject.replace('{club}', club.name));
    setContent(tpl.content.replace('{club}', club.name));
  };

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) {
      toast.error('Completá el asunto y el contenido del newsletter');
      return;
    }
    setSending(true);
    try {
      const res = await api.post('/newsletter/send', { idClub, subject: subject.trim(), content: content.trim() });
      const record: NewsletterSendRecord = getResponseData(res);
      if (record.truncatedByDailyLimit) {
        toast(
          `Se alcanzó el límite diario de emails: se envió a ${record.sentCount} de ${record.totalEligibleSubscribers ?? record.sentCount} suscriptores. El resto queda pendiente para mañana.`,
          { icon: '⚠️' },
        );
      } else if (record.failedCount > 0) {
        toast(`Enviado a ${record.sentCount} suscriptor(es), con ${record.failedCount} error(es) de entrega.`, { icon: '⚠️' });
      } else {
        toast.success(`Newsletter enviado correctamente a ${record.sentCount} suscriptor(es).`);
      }
      setSubject('');
      setContent('');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Error al enviar el newsletter');
    } finally {
      setSending(false);
    }
  };

  if (activeSection === 'nuevo') {
    return (
      <div className="animate-fadeInUp">
        <h2 className="font-serif text-xl font-bold text-aurora-navy mb-2">Nuevo Newsletter</h2>
        <p className="text-sm text-aurora-navy/60 mb-6">
          {loadingSubscribers ? 'Calculando audiencia...' : `Se enviará por email a ${subscriberCount ?? 0} suscriptor(es) que aceptaron recibir novedades.`}
        </p>
        <div className="space-y-4 max-w-2xl">
          <input
            type="text"
            placeholder="Asunto"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-aurora-terracotta/40"
          />
          <textarea
            placeholder="Contenido del newsletter"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-aurora-navy/15 rounded-lg text-sm"
            rows={10}
          />
          <div className="flex gap-3">
            <button onClick={saveDraft} disabled={sending} className="px-4 py-2 bg-aurora-cream text-aurora-navy text-sm font-medium rounded-lg hover:bg-aurora-creamDark transition-colors disabled:opacity-50">
              Guardar borrador
            </button>
            <button onClick={handleSend} disabled={sending} className="px-4 py-2 bg-aurora-terracotta text-white text-sm font-medium rounded-lg hover:bg-aurora-terracottaDark transition-colors disabled:opacity-50">
              {sending ? 'Enviando...' : 'Enviar newsletter'}
            </button>
          </div>
          {(subject || content) && (
            <div className="mt-6 border border-aurora-navy/10 rounded-xl p-4 bg-aurora-cream/50">
              <p className="text-xs font-medium text-aurora-navy/50 mb-2">Vista previa</p>
              <h3 className="font-bold text-aurora-navy">{subject}</h3>
              <p className="text-sm text-aurora-navy/80 whitespace-pre-line mt-2">{content}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeSection === 'borradores') {
    return (
      <div className="animate-fadeInUp">
        <h2 className="font-serif text-xl font-bold text-aurora-navy mb-6">Borradores</h2>
        {drafts.length === 0 ? (
          <div className="text-center py-16 text-aurora-navy/50">No hay borradores guardados.</div>
        ) : (
          <div className="space-y-3">
            {drafts.map((draft) => (
              <div key={draft.id} className="border border-aurora-navy/10 rounded-xl p-4">
                <h3 className="font-semibold text-aurora-navy">{draft.subject || '(Sin asunto)'}</h3>
                <p className="text-xs text-aurora-navy/50 mb-2">{new Date(draft.createdAt).toLocaleString('es-AR')}</p>
                <p className="text-sm text-aurora-navy/70 truncate">{draft.content}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => loadDraft(draft)} className="text-xs font-medium px-3 py-1 rounded bg-aurora-navy/10 text-aurora-navy hover:bg-aurora-navy/20">
                    Continuar editando
                  </button>
                  <button onClick={() => removeDraft(draft.id)} className="text-xs font-medium px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeSection === 'plantillas') {
    return (
      <div className="animate-fadeInUp">
        <h2 className="font-serif text-xl font-bold text-aurora-navy mb-6">Plantillas</h2>
        <div className="space-y-3">
          {TEMPLATES.map((tpl) => (
            <div key={tpl.id} className="border border-aurora-navy/10 rounded-xl p-4 hover:bg-aurora-cream/50 cursor-pointer transition-colors" onClick={() => applyTemplate(tpl)}>
              <h3 className="font-semibold text-aurora-navy">{tpl.name}</h3>
              <p className="text-sm text-aurora-navy/50">{tpl.subject.replace('{club}', club.name)}</p>
              <p className="text-sm text-aurora-navy/70 mt-1">{tpl.content.replace('{club}', club.name)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const completedRecords = history.filter((r) => r.status !== 'Enviando');
  const totalSent = completedRecords.length;
  const totalRecipients = completedRecords.reduce((acc, r) => acc + r.sentCount, 0);

  if (loadingHistory) {
    return <div className="text-center py-16 text-aurora-navy/50">Cargando historial...</div>;
  }

  return (
    <div className="animate-fadeInUp">
      <h2 className="font-serif text-xl font-bold text-aurora-navy mb-6">Métricas e Historial de Envíos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-aurora-navy/10 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-aurora-navy">{totalSent}</p>
          <p className="text-sm text-aurora-navy/60 mt-1">Newsletters enviados</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-emerald-600">{totalRecipients}</p>
          <p className="text-sm text-aurora-navy/60 mt-1">Total de destinatarios alcanzados</p>
        </div>
        <div className="bg-aurora-gold/10 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-aurora-terracottaDark">{subscriberCount ?? '—'}</p>
          <p className="text-sm text-aurora-navy/60 mt-1">Suscriptores actuales con opt-in</p>
        </div>
      </div>
      <h3 className="text-md font-semibold text-aurora-navy mb-3">Historial de Envíos</h3>
      {history.length === 0 ? (
        <div className="text-center py-16 text-aurora-navy/50">Todavía no enviaste ningún newsletter.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-aurora-navy/10 border border-aurora-navy/10 rounded-xl">
            <thead className="bg-aurora-cream">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Asunto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Destinatarios</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-aurora-navy/60 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aurora-navy/10">
              {history.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-3 text-sm text-aurora-navy/80 whitespace-nowrap">{new Date(record.createdAt).toLocaleDateString('es-AR')}</td>
                  <td className="px-4 py-3 text-sm text-aurora-navy">{record.subject}</td>
                  <td className="px-4 py-3 text-sm text-aurora-navy/70">{record.sentCount} / {record.recipientCount}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[record.status]}`}>
                      {STATUS_LABELS[record.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SendNewsletterContent;
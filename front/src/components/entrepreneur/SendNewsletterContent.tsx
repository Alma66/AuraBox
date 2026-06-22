import React, { useEffect, useState } from 'react';
import api, { getResponseData } from '../../api/config';
import { Club } from '../../types/club';

interface SendNewsletterContentProps {
  activeSection: string;
  club: Club;
  onUpdateClub: (updatedClub: Club) => void;
}

interface Draft {
  id: string;
  subject: string;
  content: string;
  createdAt: string;
}

interface SentRecord {
  id: string;
  subject: string;
  content: string;
  sentAt: string;
  recipients: number;
}

const TEMPLATES = [
  { id: 'tpl-1', name: 'Bienvenida', subject: '¡Bienvenido a {club}!', content: 'Gracias por unirte a nuestra comunidad. Tu primera caja está en camino.' },
  { id: 'tpl-2', name: 'Promoción mensual', subject: 'Oferta especial este mes en {club}', content: 'Tenemos un descuento especial este mes. ¡No te lo pierdas!' },
  { id: 'tpl-3', name: 'Aviso de envío', subject: 'Tu caja de {club} ya salió', content: 'Tu pedido de este mes ya está en camino. Pronto la recibirás en tu domicilio.' },
];

const STORAGE_KEY_PREFIX = 'aurabox-newsletter-';

const SendNewsletterContent: React.FC<SendNewsletterContentProps> = ({ activeSection, club }) => {
  const idClub = Number(club.id);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [sent, setSent] = useState<SentRecord[]>([]);

  const draftsKey = `${STORAGE_KEY_PREFIX}drafts-${idClub}`;
  const sentKey = `${STORAGE_KEY_PREFIX}sent-${idClub}`;

  useEffect(() => {
    const storedDrafts = localStorage.getItem(draftsKey);
    const storedSent = localStorage.getItem(sentKey);
    setDrafts(storedDrafts ? JSON.parse(storedDrafts) : []);
    setSent(storedSent ? JSON.parse(storedSent) : []);
  }, [draftsKey, sentKey]);

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

  const persistDrafts = (next: Draft[]) => {
    setDrafts(next);
    localStorage.setItem(draftsKey, JSON.stringify(next));
  };

  const persistSent = (next: SentRecord[]) => {
    setSent(next);
    localStorage.setItem(sentKey, JSON.stringify(next));
  };

  const saveDraft = () => {
    if (!subject && !content) return;
    const draft: Draft = { id: `draft-${Date.now()}`, subject, content, createdAt: new Date().toISOString() };
    persistDrafts([draft, ...drafts]);
    setSubject('');
    setContent('');
    alert('Guardado como borrador');
  };

  const removeDraft = (id: string) => {
    persistDrafts(drafts.filter((d) => d.id !== id));
  };

  const loadDraft = (draft: Draft) => {
    setSubject(draft.subject);
    setContent(draft.content);
  };

  const useTemplate = (tpl: typeof TEMPLATES[number]) => {
    setSubject(tpl.subject.replace('{club}', club.name));
    setContent(tpl.content.replace('{club}', club.name));
  };

  const handleSend = async () => {
    if (!subject || !content) {
      alert('Completá el asunto y el contenido del newsletter');
      return;
    }
    try {
      const res = await api.get(`/users/newsletter-subscribers/${idClub}`);
      const recipients = (getResponseData(res) || []).length;
      const record: SentRecord = {
        id: `sent-${Date.now()}`,
        subject,
        content,
        sentAt: new Date().toISOString(),
        recipients,
      };
      persistSent([record, ...sent]);
      setSubject('');
      setContent('');
      alert(`Newsletter enviado a ${recipients} suscriptor(es).`);
    } catch (err) {
      console.error(err);
      alert('Error al enviar el newsletter');
    }
  };

  if (activeSection === 'nuevo') {
    return (
      <div className="animate-fadeInUp">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Nuevo Newsletter</h2>
        <p className="text-sm text-gray-500 mb-6">
          {loadingSubscribers ? 'Calculando audiencia...' : `Se enviará a ${subscriberCount ?? 0} suscriptor(es) que aceptaron recibir novedades.`}
        </p>
        <div className="space-y-4 max-w-2xl">
          <input
            type="text"
            placeholder="Asunto"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <textarea
            placeholder="Contenido del newsletter"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            rows={10}
          />
          <div className="flex gap-3">
            <button onClick={saveDraft} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
              Guardar borrador
            </button>
            <button onClick={handleSend} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Enviar newsletter
            </button>
          </div>
          {(subject || content) && (
            <div className="mt-6 border border-gray-200 rounded-xl p-4 bg-gray-50">
              <p className="text-xs font-medium text-gray-500 mb-2">Vista previa</p>
              <h3 className="font-bold text-gray-900">{subject}</h3>
              <p className="text-sm text-gray-700 whitespace-pre-line mt-2">{content}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeSection === 'borradores') {
    return (
      <div className="animate-fadeInUp">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Borradores</h2>
        {drafts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No hay borradores guardados.</div>
        ) : (
          <div className="space-y-3">
            {drafts.map((draft) => (
              <div key={draft.id} className="border border-gray-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900">{draft.subject || '(Sin asunto)'}</h3>
                <p className="text-xs text-gray-500 mb-2">{new Date(draft.createdAt).toLocaleString('es-AR')}</p>
                <p className="text-sm text-gray-600 truncate">{draft.content}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => loadDraft(draft)} className="text-xs font-medium px-3 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">
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
        <h2 className="text-xl font-bold text-gray-900 mb-6">Plantillas</h2>
        <div className="space-y-3">
          {TEMPLATES.map((tpl) => (
            <div key={tpl.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 cursor-pointer" onClick={() => useTemplate(tpl)}>
              <h3 className="font-semibold text-gray-900">{tpl.name}</h3>
              <p className="text-sm text-gray-500">{tpl.subject.replace('{club}', club.name)}</p>
              <p className="text-sm text-gray-600 mt-1">{tpl.content.replace('{club}', club.name)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalSent = sent.length;
  const totalRecipients = sent.reduce((acc, s) => acc + s.recipients, 0);

  return (
    <div className="animate-fadeInUp">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Métricas e Historial de Envíos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-blue-600">{totalSent}</p>
          <p className="text-sm text-gray-600 mt-1">Newsletters enviados</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-emerald-600">{totalRecipients}</p>
          <p className="text-sm text-gray-600 mt-1">Total de destinatarios alcanzados</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-purple-600">{subscriberCount ?? '—'}</p>
          <p className="text-sm text-gray-600 mt-1">Suscriptores actuales con opt-in</p>
        </div>
      </div>
      <h3 className="text-md font-semibold text-gray-900 mb-3">Historial de Envíos</h3>
      {sent.length === 0 ? (
        <div className="text-center py-16 text-gray-500">Todavía no enviaste ningún newsletter.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 border border-gray-200 rounded-xl">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Asunto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Destinatarios</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sent.map((record) => (
                <tr key={record.id}>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">{new Date(record.sentAt).toLocaleDateString('es-AR')}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{record.subject}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{record.recipients}</td>
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
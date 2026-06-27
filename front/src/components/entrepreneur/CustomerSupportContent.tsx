import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import api, { getResponseData } from '../../api/config';
import { Club } from '../../types/club';
import { SupportConversation, SupportMessage, AutoReplyRule, AutoReplyTrigger } from '../../types/support';
import CustomerInfoPanel from './CustomerInfoPanel';

interface CustomerSupportContentProps {
  activeSection: string;
  club: Club;
}

interface SubscriptionTypeOption {
  id: number;
  name: string;
}

interface UserOption {
  id: number;
  firstName: string;
  lastName: string;
}

const formatRelativeDate = (iso: string) => {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Hoy';
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
  return date.toLocaleDateString('es-AR');
};

const CustomerSupportContent: React.FC<CustomerSupportContentProps> = ({ activeSection, club }) => {
  const idClub = Number(club.id);
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [subscriptionTypes, setSubscriptionTypes] = useState<SubscriptionTypeOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyFile, setReplyFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  const [filterSub, setFilterSub] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');

  const [autoReplies, setAutoReplies] = useState<AutoReplyRule[]>([]);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleTrigger, setNewRuleTrigger] = useState<AutoReplyTrigger>('Primer_Mensaje');
  const [newRuleValue, setNewRuleValue] = useState('');
  const [newRuleMessage, setNewRuleMessage] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);

  const status = activeSection === 'cerradas' ? 'Cerrada' : 'Abierta';

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const [convRes, subsRes] = await Promise.all([
        api.get(`/support/conversations/by-club/${idClub}`, { params: { status } }),
        api.get('/subscription-types', { params: { clubId: idClub } }),
      ]);
      const convs: SupportConversation[] = getResponseData(convRes) || [];
      setConversations(convs);
      setSubscriptionTypes(getResponseData(subsRes) || []);

      const userIds = Array.from(new Set(convs.map((c) => c.idUser)));
      const userResults = await Promise.all(
        userIds.map((id) => api.get(`/users/${id}`).then((r) => getResponseData(r)).catch(() => null)),
      );
      setUsers(userResults.filter(Boolean));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [idClub, status]);

  const fetchAutoReplies = useCallback(async () => {
    try {
      const res = await api.get(`/support/auto-replies/by-club/${idClub}`);
      setAutoReplies(getResponseData(res) || []);
    } catch (err) {
      console.error(err);
    }
  }, [idClub]);

  useEffect(() => {
    if (activeSection === 'automaticos') {
      fetchAutoReplies();
    } else {
      fetchConversations();
      setSelectedId(null);
      setMessages([]);
    }
  }, [activeSection, fetchConversations, fetchAutoReplies]);

  const fetchMessages = useCallback(async (idConversation: number) => {
    try {
      const res = await api.get(`/support/conversations/${idConversation}/messages`);
      setMessages(getResponseData(res) || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConversation = async (conv: SupportConversation) => {
    setSelectedId(conv.id);
    await fetchMessages(conv.id);
    if (conv.hasUnreadForEntrepreneur) {
      try {
        await api.patch(`/support/conversations/${conv.id}/read`);
        setConversations((prev) => prev.map((c) => (c.id === conv.id ? { ...c, hasUnreadForEntrepreneur: false } : c)));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const userName = (idUser: number) => {
    const u = users.find((x) => x.id === idUser);
    return u ? `${u.firstName} ${u.lastName}` : `Usuario #${idUser}`;
  };

  const subName = (id: number) => subscriptionTypes.find((s) => s.id === id)?.name ?? 'Sin especificar';

  const filteredConversations = useMemo(() => {
    let list = [...conversations];
    if (filterSub !== 'all') list = list.filter((c) => String(c.idSubscriptionTypes) === filterSub);
    if (filterUser !== 'all') list = list.filter((c) => String(c.idUser) === filterUser);
    if (filterRead === 'unread') list = list.filter((c) => c.hasUnreadForEntrepreneur);
    if (filterRead === 'read') list = list.filter((c) => !c.hasUnreadForEntrepreneur);
    list.sort((a, b) => {
      const diff = new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      return sortOrder === 'recent' ? diff : -diff;
    });
    return list;
  }, [conversations, filterSub, filterUser, filterRead, sortOrder]);

  const sendReply = async () => {
    if (!selectedId || (!replyText.trim() && !replyFile)) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append('idConversation', String(selectedId));
      if (replyText.trim()) formData.append('content', replyText.trim());
      if (replyFile) formData.append('files', replyFile);
      await api.post('/support/messages/entrepreneur', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setReplyText('');
      setReplyFile(null);
      await fetchMessages(selectedId);
      await fetchConversations();
    } catch (err) {
      console.error(err);
      alert('Error al enviar la respuesta');
    } finally {
      setSending(false);
    }
  };

  const closeConversation = async () => {
    if (!selectedId) return;
    try {
      await api.patch(`/support/conversations/${selectedId}/close`);
      await fetchConversations();
      setSelectedId(null);
      setMessages([]);
    } catch (err) {
      console.error(err);
      alert('Error al cerrar la conversación');
    }
  };

  const reopenConversation = async () => {
    if (!selectedId) return;
    try {
      await api.patch(`/support/conversations/${selectedId}/reopen`);
      await fetchConversations();
      setSelectedId(null);
      setMessages([]);
    } catch (err) {
      console.error(err);
      alert('Error al reabrir la conversación');
    }
  };

  const createAutoReply = async () => {
    if (!newRuleName || !newRuleMessage) {
      alert('Completá el nombre y el mensaje de respuesta');
      return;
    }
    try {
      await api.post('/support/auto-replies', {
        idClub,
        name: newRuleName,
        triggerType: newRuleTrigger,
        triggerValue: newRuleTrigger === 'Contiene_Frase' ? newRuleValue : undefined,
        replyMessage: newRuleMessage,
      });
      setNewRuleName('');
      setNewRuleValue('');
      setNewRuleMessage('');
      await fetchAutoReplies();
    } catch (err) {
      console.error(err);
      alert('Error al crear la regla');
    }
  };

  const toggleAutoReply = async (rule: AutoReplyRule) => {
    try {
      await api.put(`/support/auto-replies/${rule.id}`, { active: !rule.active });
      await fetchAutoReplies();
    } catch (err) {
      console.error(err);
      alert('Error al actualizar la regla');
    }
  };

  const removeAutoReply = async (id: number) => {
    if (!window.confirm('¿Eliminar esta regla de mensaje automático?')) return;
    try {
      await api.delete(`/support/auto-replies/${id}`);
      await fetchAutoReplies();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar la regla');
    }
  };

  if (activeSection === 'automaticos') {
    return (
      <div className="animate-fadeInUp">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Mensajes Automáticos</h2>
        <p className="text-sm text-gray-500 mb-6">Configurá respuestas automáticas para el primer mensaje de cada cliente o cuando se detecte una frase específica.</p>

        <div className="border border-gray-200 rounded-xl p-5 mb-8 max-w-xl space-y-3">
          <input
            type="text"
            placeholder="Nombre de la regla"
            value={newRuleName}
            onChange={(e) => setNewRuleName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <select value={newRuleTrigger} onChange={(e) => setNewRuleTrigger(e.target.value as AutoReplyTrigger)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="Primer_Mensaje">Al recibir el primer mensaje del cliente</option>
            <option value="Contiene_Frase">Cuando el mensaje contiene una frase específica</option>
          </select>
          {newRuleTrigger === 'Contiene_Frase' && (
            <input
              type="text"
              placeholder="Frase a detectar"
              value={newRuleValue}
              onChange={(e) => setNewRuleValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          )}
          <textarea
            placeholder="Mensaje de respuesta automática"
            value={newRuleMessage}
            onChange={(e) => setNewRuleMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            rows={3}
          />
          <button onClick={createAutoReply} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
            Crear regla
          </button>
        </div>

        <div className="space-y-3">
          {autoReplies.map((rule) => (
            <div key={rule.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{rule.name}</p>
                  <p className="text-xs text-gray-500">
                    {rule.triggerType === 'Primer_Mensaje' ? 'Se activa con el primer mensaje' : `Se activa si contiene: "${rule.triggerValue}"`}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${rule.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                  {rule.active ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{rule.replyMessage}</p>
              <div className="flex gap-2">
                <button onClick={() => toggleAutoReply(rule)} className="text-xs font-medium px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">
                  {rule.active ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => removeAutoReply(rule.id)} className="text-xs font-medium px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {autoReplies.length === 0 && <p className="text-center py-8 text-gray-500">No hay reglas configuradas todavía.</p>}
        </div>
      </div>
    );
  }

  if (loading) return <div className="text-center py-16 text-gray-500">Cargando conversaciones...</div>;

  const selectedConv = conversations.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="animate-fadeInUp flex flex-col lg:flex-row gap-4 h-[700px]">
      <div className="lg:w-2/5 flex flex-col border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-gray-200 flex flex-wrap gap-2">
          <select value={filterSub} onChange={(e) => setFilterSub(e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-xs flex-1 min-w-[100px]">
            <option value="all">Suscripción</option>
            {subscriptionTypes.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-xs flex-1 min-w-[100px]">
            <option value="all">Usuario</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
            ))}
          </select>
          <select value={filterRead} onChange={(e) => setFilterRead(e.target.value)} className="px-2 py-1 border border-gray-300 rounded text-xs flex-1 min-w-[90px]">
            <option value="all">Leídos/No leídos</option>
            <option value="unread">No leídos</option>
            <option value="read">Leídos</option>
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'recent' | 'oldest')} className="px-2 py-1 border border-gray-300 rounded text-xs flex-1 min-w-[90px]">
            <option value="recent">Más reciente</option>
            <option value="oldest">Más antiguo</option>
          </select>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => openConversation(conv)}
              className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedId === conv.id ? 'bg-blue-50' : ''}`}
            >
              <div className="flex justify-between items-start">
                <p className="font-semibold text-gray-900 text-sm truncate">{userName(conv.idUser)}</p>
                {conv.hasUnreadForEntrepreneur && <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1" />}
              </div>
              <p className="text-xs text-gray-600 truncate">{conv.subject}</p>
              <p className="text-xs text-gray-400">{subName(conv.idSubscriptionTypes)} · {formatRelativeDate(conv.lastMessageAt)}</p>
            </button>
          ))}
          {filteredConversations.length === 0 && <p className="text-center py-8 text-gray-500 text-sm">No hay conversaciones.</p>}
        </div>
      </div>

      <div className="lg:w-3/5 flex flex-col border border-gray-200 rounded-xl overflow-hidden">
        {!selectedConv ? (
          <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">Seleccioná una conversación</div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-900">{userName(selectedConv.idUser)}</p>
                <p className="text-xs text-gray-500">{selectedConv.subject} · {subName(selectedConv.idSubscriptionTypes)}</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedConv.status === 'Abierta' ? (
                  <button onClick={closeConversation} className="text-xs font-medium px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">
                    Cerrar chat
                  </button>
                ) : (
                  <button onClick={reopenConversation} className="text-xs font-medium px-3 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                    Reabrir
                  </button>
                )}
                <button onClick={() => setShowInfo(true)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200" title="Información del cliente">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderType === 'Entrepreneur' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md p-3 rounded-2xl text-sm ${
                    msg.senderType === 'Entrepreneur' ? 'bg-blue-600 text-white' :
                    msg.senderType === 'System' ? 'bg-amber-100 text-amber-900' : 'bg-white text-gray-900 border border-gray-200'
                  }`}>
                    {msg.content && <p>{msg.content}</p>}
                    {msg.attachments.map((att) => (
                      att.fileType === 'Video' ? (
                        <video key={att.id} src={att.fileUrl} controls className="mt-2 max-w-full rounded-lg" />
                      ) : (
                        <img key={att.id} src={att.fileUrl} alt="" className="mt-2 max-w-full rounded-lg" />
                      )
                    ))}
                    <p className={`text-xs mt-1 ${msg.senderType === 'Entrepreneur' ? 'text-blue-100' : 'text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      {msg.isAutoReply ? ' · Automático' : ''}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {selectedConv.status === 'Abierta' && (
              <div className="p-3 border-t border-gray-200 flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribí una respuesta..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <label className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg cursor-pointer hover:bg-gray-200">
                    📎
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => setReplyFile(e.target.files?.[0] ?? null)} />
                  </label>
                  <button onClick={sendReply} disabled={sending} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    Enviar
                  </button>
                </div>
                {replyFile && <p className="text-xs text-gray-500">Adjunto: {replyFile.name}</p>}
              </div>
            )}
          </>
        )}
      </div>

      {showInfo && selectedId && <CustomerInfoPanel idConversation={selectedId} onClose={() => setShowInfo(false)} />}
    </div>
  );
};

export default CustomerSupportContent;
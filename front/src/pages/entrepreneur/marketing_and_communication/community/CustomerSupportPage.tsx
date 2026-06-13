import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../App';
import api, { getResponseData } from '../../../../api/config';

interface Message {
  id: string;
  clubId: string;
  userId: string;
  subject: string;
  message: string;
  timestamp: string;
  status: 'new' | 'read' | 'resolved';
  associatedPurchaseId?: string;
  conversation: { sender: string; message: string; timestamp: string }[];
}

const CustomerSupportPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'read' | 'resolved'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [clubName, setClubName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (userRole !== 'entrepreneur' || !user?.managedClubId || user.managedClubId !== clubId) {
        navigate('/login');
        return;
      }

      try {
        const [clubResponse, messagesResponse] = await Promise.all([
          api.get(`/clubs/${clubId}`),
          api.get(`/clubs/${clubId}/messages`)
        ]);

        const clubData = getResponseData(clubResponse);
        const messagesData = getResponseData(messagesResponse);

        setClubName(clubData.name || 'Club');
        setMessages(messagesData || []);
        setFilteredMessages(messagesData || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };
    if (clubId) fetchData();
  }, [clubId, user, userRole, navigate]);

  useEffect(() => {
    let tempMessages = [...messages];

    if (filterStatus !== 'all') {
      tempMessages = tempMessages.filter(msg => msg.status === filterStatus);
    }

    if (searchTerm) {
      tempMessages = tempMessages.filter(msg =>
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMessages(tempMessages);
  }, [messages, filterStatus, searchTerm]);

 

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message);
    if (message.status === 'new') {
      try {
        await api.put(`/clubs/${clubId}/messages/${message.id}`, { status: 'read' });
        setMessages(prevMessages =>
          prevMessages.map(msg => (msg.id === message.id ? { ...msg, status: 'read' } : msg))
        );
      } catch (error) {
        console.error("Error updating message status:", error);
      }
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    try {
      const response = await api.post(`/clubs/${clubId}/messages/${selectedMessage.id}/reply`, {
        message: replyText.trim()
      });
      const updatedMessage = getResponseData(response);

      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === selectedMessage.id ? updatedMessage : msg
        )
      );
      setSelectedMessage(updatedMessage);
      setReplyText('');
    } catch (error) {
      console.error("Error sending reply:", error);
      alert('Error al enviar respuesta');
    }
  };

  const handleMarkAsResolved = async () => {
    if (!selectedMessage) return;

    try {
      await api.put(`/clubs/${clubId}/messages/${selectedMessage.id}`, { status: 'resolved' });
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === selectedMessage.id ? { ...msg, status: 'resolved' } : msg
        )
      );
      setSelectedMessage(prev => prev ? { ...prev, status: 'resolved' } : null);
    } catch (error) {
      console.error("Error resolving message:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-20">Cargando mensajes...</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
      <div className="lg:w-1/3 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Atención al Cliente de {clubName}</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por asunto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md mb-2"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="all">Todos los estados</option>
            <option value="new">Nuevos</option>
            <option value="read">Leídos</option>
            <option value="resolved">Resueltos</option>
          </select>
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <p className="text-gray-600 text-center">No hay mensajes.</p>
          ) : (
            filteredMessages.map(msg => (
              <div
                key={msg.id}
                className={`p-4 border rounded-lg cursor-pointer ${
                  selectedMessage?.id === msg.id ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => handleMessageClick(msg)}
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-gray-800 truncate">{msg.subject}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    msg.status === 'new' ? 'bg-red-100 text-red-800' :
                    msg.status === 'read' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {msg.status === 'new' ? 'Nuevo' : msg.status === 'read' ? 'Leído' : 'Resuelto'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleDateString('es-AR')}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="lg:w-2/3 bg-white shadow-md rounded-lg p-6">
        {selectedMessage ? (
          <>
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedMessage.subject}</h2>
              <p className="text-sm text-gray-500">
                {new Date(selectedMessage.timestamp).toLocaleString('es-AR')}
              </p>
              {selectedMessage.status !== 'resolved' && (
                <button
                  onClick={handleMarkAsResolved}
                  className="mt-3 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                >
                  Marcar como Resuelto
                </button>
              )}
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4 pr-2">
              {selectedMessage.conversation.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'entrepreneur' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-lg p-3 rounded-lg ${
                    msg.sender === 'entrepreneur' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs text-gray-500 text-right mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString('es-AR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md mb-3"
                rows={3}
                placeholder="Escribe tu respuesta..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              ></textarea>
              <button
                onClick={handleReply}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Enviar Respuesta
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-600">
            Selecciona un mensaje para ver la conversación.
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSupportPage;
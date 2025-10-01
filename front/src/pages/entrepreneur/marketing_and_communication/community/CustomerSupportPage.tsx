// FileName: src/pages/entrepreneur/CustomerSupportPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../../App';
import { User } from '../../../../types/user';
import { Club } from '../../../../types/club';
import { Subscription } from '../../../../types/subscription';

// Importar datos simulados
import usersData from '../../../../data/user.json';
import clubsData from '../../../../data/clubs.json';
import subscriptionsData from '../../../../data/subscriptions.json';
import messagesData from '../../../../data/messages.json'; // Nuevo archivo de mensajes

// Definir la interfaz para un mensaje (puede ser más detallada si es necesario)
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
  const { user, isAuthenticated, userRole } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'read' | 'resolved'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const currentEntrepreneur = user as User;
  const managedClub = clubsData.find(c => c.id === currentEntrepreneur?.managedClubId) as Club;

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'entrepreneur' || !clubId || currentEntrepreneur?.managedClubId !== clubId) {
      // Redirigir o mostrar error si el usuario no es el emprendedor correcto para este club
      return;
    }

    // Simular carga de mensajes para el club del emprendedor
    const clubMessages = (messagesData as Message[]).filter(msg => msg.clubId === clubId);
    setMessages(clubMessages);
    setFilteredMessages(clubMessages);
  }, [isAuthenticated, userRole, clubId, currentEntrepreneur]);

  // Aplicar filtros
  useEffect(() => {
    let tempMessages = messages;

    if (filterStatus !== 'all') {
      tempMessages = tempMessages.filter(msg => msg.status === filterStatus);
    }

    if (searchTerm) {
      tempMessages = tempMessages.filter(msg =>
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usersData.find(u => u.id === msg.userId)?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usersData.find(u => u.id === msg.userId)?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMessages(tempMessages);
  }, [messages, filterStatus, searchTerm]);

  const getCustomerName = (userId: string) => {
    const customer = usersData.find(u => u.id === userId);
    return customer ? `${customer.firstName} ${customer.lastName}` : 'Cliente Desconocido';
  };

  const getSubscriptionInfo = (subscriptionId?: string) => {
    if (!subscriptionId) return 'N/A';
    const subscription = (subscriptionsData as Subscription[]).find(sub => sub.id === subscriptionId);
    return subscription ? `Suscripción: ${subscription.id} (Plan: ${subscription.planId})` : 'Suscripción Desconocida';
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    // Marcar como leído si es 'new'
    if (message.status === 'new') {
      setMessages(prevMessages =>
        prevMessages.map(msg => (msg.id === message.id ? { ...msg, status: 'read' } : msg))
      );
    }
  };

  const handleReply = () => {
    if (selectedMessage && replyText.trim()) {
      const newReply = {
        sender: 'entrepreneur', // O el nombre del emprendedor
        message: replyText.trim(),
        timestamp: new Date().toISOString(),
      };
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === selectedMessage.id
            ? { ...msg, conversation: [...msg.conversation, newReply], status: 'read' }
            : msg
        )
      );
      setSelectedMessage(prev => prev ? { ...prev, conversation: [...prev.conversation, newReply], status: 'read' } : null);
      setReplyText('');
    }
  };

  const handleMarkAsResolved = () => {
    if (selectedMessage) {
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === selectedMessage.id ? { ...msg, status: 'resolved' } : msg
        )
      );
      setSelectedMessage(prev => prev ? { ...prev, status: 'resolved' } : null);
    }
  };

  if (!isAuthenticated || userRole !== 'entrepreneur' || !managedClub) {
    return <div className="text-center py-8 text-red-500">Acceso denegado o club no encontrado.</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
      {/* Panel de lista de mensajes */}
      <div className="lg:w-1/3 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Atención al Cliente de {managedClub.name}</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por asunto o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mb-2"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'new' | 'read' | 'resolved')}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos los estados</option>
            <option value="new">Nuevos</option>
            <option value="read">Leídos</option>
            <option value="resolved">Resueltos</option>
          </select>
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <p className="text-gray-600 text-center">No hay mensajes para mostrar.</p>
          ) : (
            filteredMessages.map(msg => (
              <div
                key={msg.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedMessage?.id === msg.id ? 'bg-blue-50 border-blue-500 shadow-inner' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                }`}
                onClick={() => handleMessageClick(msg)}
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-gray-800 truncate">{msg.subject}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    msg.status === 'new' ? 'bg-red-100 text-red-800' :
                    msg.status === 'read' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {msg.status === 'new' ? 'Nuevo' : msg.status === 'read' ? 'Leído' : 'Resuelto'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">De: {getCustomerName(msg.userId)}</p>
                <p className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Panel de detalle del mensaje y chat */}
      <div className="lg:w-2/3 bg-white shadow-md rounded-lg p-6">
        {selectedMessage ? (
          <>
            <div className="border-b pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedMessage.subject}</h2>
              <p className="text-gray-700 mb-1">
                <span className="font-semibold">Cliente:</span> {getCustomerName(selectedMessage.userId)}
              </p>
              <p className="text-gray-700 mb-1">
                <span className="font-semibold">Suscripción:</span> {getSubscriptionInfo(selectedMessage.associatedPurchaseId)}
              </p>
              <p className="text-sm text-gray-500">
                Recibido el:{' '}
                {new Date(selectedMessage.timestamp).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <div className="mt-3">
                {selectedMessage.status !== 'resolved' && (
                  <button
                    onClick={handleMarkAsResolved}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                  >
                    Marcar como Resuelto
                  </button>
                )}
              </div>
            </div>

            {/* Conversación */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4 pr-2">
              {selectedMessage.conversation.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'entrepreneur' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-lg p-3 rounded-lg shadow-sm ${
                      msg.sender === 'entrepreneur'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="font-semibold text-sm mb-1">
                      {msg.sender === 'entrepreneur' ? 'Tú' : getCustomerName(selectedMessage.userId)}
                    </p>
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs text-gray-500 text-right mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Área de respuesta */}
            <div className="border-t pt-4">
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mb-3"
                rows={3}
                placeholder="Escribe tu respuesta aquí..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              ></textarea>
              <button
                onClick={handleReply}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Enviar Respuesta
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-600">
            Selecciona un mensaje de la izquierda para ver la conversación.
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerSupportPage;
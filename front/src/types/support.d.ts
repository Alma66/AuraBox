export type ConversationStatus = 'Abierta' | 'Cerrada';
export type SenderType = 'User' | 'Entrepreneur' | 'System';
export type AutoReplyTrigger = 'Primer_Mensaje' | 'Contiene_Frase';
export type VerificationChannel = 'Email' | 'SMS';

export interface SupportConversation {
  id: number;
  idClub: number;
  idUser: number;
  idSubscriptionTypes: number;
  subject: string;
  status: ConversationStatus;
  createdAt: string;
  closedAt?: string | null;
  lastMessageAt: string;
  hasUnreadForEntrepreneur: boolean;
  hasUnreadForUser: boolean;
  customerFirstName?: string | null;
  customerLastName?: string | null;
}

export interface SupportMessageAttachment {
  id: number;
  idMessage: number;
  fileUrl: string;
  fileType: 'Imagen' | 'Video';
  fileName?: string | null;
}

export interface SupportMessage {
  id: number;
  idConversation: number;
  senderType: SenderType;
  senderId: number;
  content?: string | null;
  isAutoReply: boolean;
  createdAt: string;
  attachments: SupportMessageAttachment[];
}

export interface AutoReplyRule {
  id: number;
  idClub: number;
  name: string;
  triggerType: AutoReplyTrigger;
  triggerValue?: string | null;
  replyMessage: string;
  active: boolean;
  createdAt: string;
}

export interface BasicCustomerInfo {
  subscriptionName: string;
  startDate: string;
  paymentMethodType: string;
  shipmentStatus: string;
  courier: string | null;
  rider: string | null;
  province: string | null;
  locality: string | null;
}

export interface SensitiveCustomerData {
  dni: number;
  phoneNumber: number | null;
  streetAddress: string | null;
  addressNumber: number | null;
  floorNumber: string | null;
  addressDetails: string | null;
  postalCode: string | null;
  city: string | null;
  lastCardDigits: (string | null)[];
}
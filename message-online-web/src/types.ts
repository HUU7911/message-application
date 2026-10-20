// Khớp với các DTO trong backend (ApiResponse, ChatMessageResponse, ConversationResponse...)

export interface ApiResponse<T> {
  code: number; // 1000 = thành công
  message?: string;
  results?: T;
}

export interface AuthenticationResponse {
  token: string;
  authenticated: boolean;
}

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string | null;
  createdAt?: string;
}

export interface Participant {
  id: string;
  username: string;
  avatar?: string | null;
}

export interface Conversation {
  id: string;
  type?: string;
  conversationAvatar?: string | null;
  conversationName?: string | null;
  participants: Participant[];
  createdAt?: string | number;
  modifiedAt?: string | number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  me: boolean;
  message: string;
  sender: Participant;
  createdAt: string | number;
}

export type ConnectionStatus = 'connecting' | 'online' | 'offline';

export interface ConversationItem {
  id: string;
  title: string;
  avatar?: string | null;
  preview: string;
  time: number;
  unread: number;
}

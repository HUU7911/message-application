export interface ApiResponse<T> {
  code: number;
  message?: string;
  results: T;
}

export interface Participant {
  id: string;
  username: string;
  avatar?: string | null;
}

export interface Permission {
  name: string;
  description?: string;
}

export interface Role {
  name: string;
  description?: string;
  permissions?: Permission[];
}

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string | null;
  createdAt?: string;
  roles?: Role[];
}

export interface Conversation {
  id: string;
  type?: string;
  conversationName?: string;
  conversationAvatar?: string | null;
  participants: Participant[];
  createdAt?: string;
  modifiedAt?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  me: boolean;
  message: string;
  sender: Participant;
  createdAt: string;
}

import type { AuthenticationResponse, ChatMessage, Conversation, User } from '../types';
import { request } from './http';

export const authApi = {
  login: (username: string, password: string) =>
    request<AuthenticationResponse>('/auth/login', { method: 'POST', body: { username, password }, auth: false }),

  register: (username: string, email: string, password: string) =>
    request<User>('/users/create', { method: 'POST', body: { username, email, password }, auth: false }),

  logout: (token: string) => request<void>('/auth/logout', { method: 'POST', body: { token } }),
};

export const userApi = {
  me: () => request<User>('/users/myInfor'),
  search: (keyword: string) => request<User[]>('/users/search', { method: 'POST', body: { keyword } }),

  // PUT /users/avatar nhận multipart, tham số tên `file`, trả về UserResponse đã cập nhật.
  updateAvatar: (image: Blob) => {
    const form = new FormData();
    form.append('file', image, 'avatar.jpg');
    return request<User>('/users/avatar', { method: 'PUT', body: form });
  },

  // PUT /users/update nhận UserUpdateRequest, trả về UserResponse đã cập nhật.
  updateProfile: (data: { email: string }) => request<User>('/users/update', { method: 'PUT', body: data }),
};

export const chatApi = {
  conversations: () => request<Conversation[]>('/chat'),

  // Backend tự thêm người đang đăng nhập và gộp hội thoại trùng (participantHash),
  // nên chỉ cần gửi id của người còn lại.
  createDirect: (otherUserId: string) =>
    request<Conversation>('/chat/create', { method: 'POST', body: { type: 'DIRECT', participantIds: [otherUserId] } }),

  // Server trả tin mới nhất trước (OrderByCreatedAtDesc).
  messages: (conversationId: string) =>
    request<ChatMessage[]>(`/chatting?conversationId=${encodeURIComponent(conversationId)}`),

  send: (conversationId: string, message: string) =>
    request<ChatMessage>('/chatting/create', { method: 'POST', body: { conversationId, message } }),
};

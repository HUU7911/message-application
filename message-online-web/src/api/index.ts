import { request } from "./client";
import type { ChatMessage, Conversation, Permission, Role, User } from "../types";

export const authApi = {
  login: (username: string, password: string) =>
    request<{ token: string; authenticated: boolean }>("/auth/login", {
      method: "POST", body: { username, password }, auth: false,
    }),
  google: (code: string) =>
    request<{ token: string }>("/auth/outbound/identity", {
      method: "POST", query: { code }, auth: false,
    }),
  logout: (token: string) =>
    request<void>("/auth/logout", { method: "POST", body: { token } }),
};

export const userApi = {
  register: (data: { username: string; email: string; password: string }) =>
    request<User>("/users/create", { method: "POST", body: data, auth: false }),
  me: () => request<User>("/users/myInfor"),
  search: (keyword: string) => request<User[]>("/users/search", { method: "POST", body: { keyword } }),
  update: (data: { username?: string; email?: string; password?: string }) =>
    request<User>("/users/update", { method: "PUT", body: data }),
  avatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<User>("/users/avatar", { method: "PUT", form });
  },
  // Chỉ ADMIN
  all: () => request<User[]>("/users"),
  remove: (id: string) => request<string>(`/users/${id}`, { method: "DELETE" }),
};

export const chatApi = {
  conversations: () => request<Conversation[]>("/chat"),
  create: (participantId: string) =>
    request<Conversation>("/chat/create", {
      method: "POST", body: { type: "DIRECT", participantIds: [participantId] },
    }),
  /** Backend trả về mới nhất trước → đảo lại để hiển thị cũ → mới */
  messages: async (conversationId: string) =>
    (await request<ChatMessage[]>("/chatting", { query: { conversationId } })).reverse(),
  send: (conversationId: string, message: string) =>
    request<ChatMessage>("/chatting/create", { method: "POST", body: { conversationId, message } }),
};

export const adminApi = {
  roles: () => request<Role[]>("/roles"),
  createRole: (data: { name: string; description: string; permissions: string[] }) =>
    request<Role>("/roles", { method: "POST", body: data }),
  deleteRole: (name: string) => request<void>(`/roles/${encodeURIComponent(name)}`, { method: "DELETE" }),
  permissions: () => request<Permission[]>("/permissions"),
  createPermission: (data: { name: string; description: string }) =>
    request<Permission>("/permissions", { method: "POST", body: data }),
  deletePermission: (name: string) =>
    request<void>(`/permissions/${encodeURIComponent(name)}`, { method: "DELETE" }),
};

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/message';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:8099';
export const TOKEN_KEY = 'message-online.token';

// Cho phép sửa hồ sơ qua PUT /users/update. Đặt VITE_PROFILE_EDIT=false để tắt.
export const PROFILE_EDIT_ENABLED = import.meta.env.VITE_PROFILE_EDIT !== 'false';

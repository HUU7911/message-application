import { io, type Socket } from "socket.io-client";

const SOCKET_URL: string = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:8099";

/** Backend (netty-socketio) đọc JWT từ query param `token` khi handshake. */
export const createSocket = (token: string): Socket =>
  io(SOCKET_URL, { query: { token }, transports: ["websocket", "polling"], reconnectionDelay: 1500 });

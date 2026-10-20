import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { SOCKET_URL } from './config';

/**
 * SocketHandler ở backend đọc JWT từ query param `token` khi handshake,
 * rồi tự cho client vào room của mọi hội thoại mà user tham gia.
 * Tin mới được đẩy qua event "message".
 */
export function connectSocket(token: string): Socket {
  return io(SOCKET_URL, {
    query: { token },
    transports: ['websocket'],
  });
}

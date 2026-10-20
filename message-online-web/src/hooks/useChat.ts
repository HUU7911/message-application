import { useCallback, useEffect, useRef, useState } from 'react';
import { chatApi } from '../api';
import { connectSocket } from '../socket';
import type { ChatMessage, ConnectionStatus, Conversation, User } from '../types';
import { errorMessage, mergeMessages } from '../utils';

export function useChat(token: string, me: User) {
  const meId = me.id;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeIdRef = useRef<string | null>(null);
  const loadedRef = useRef<Set<string>>(new Set());
  const conversationsRef = useRef<Conversation[]>([]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Backend tính `me` theo người GỬI rồi phát cho cả phòng, nên người nhận cũng thấy me=true.
  // Vì vậy tự xác định lại từ sender.id.
  const normalize = useCallback((m: ChatMessage): ChatMessage => ({ ...m, me: m.sender?.id === meId }), [meId]);

  const appendMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      const list = prev[msg.conversationId] ?? [];
      if (list.some((m) => m.id === msg.id)) return prev; // tin của mình đến 2 lần: REST và socket
      return { ...prev, [msg.conversationId]: [...list, msg] };
    });
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      const list = await chatApi.conversations();
      setConversations(list ?? []);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, []);

  const loadMessages = useCallback(
    async (id: string) => {
      setLoadingMessages(true);
      try {
        const list = await chatApi.messages(id);
        const ordered = [...(list ?? [])].reverse().map(normalize);
        setMessages((prev) => ({ ...prev, [id]: mergeMessages(ordered, prev[id] ?? []) }));
      } catch (e) {
        loadedRef.current.delete(id);
        setError(errorMessage(e));
      } finally {
        setLoadingMessages(false);
      }
    },
    [normalize],
  );

  // Danh sách hội thoại ban đầu.
  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  // Kết nối Socket.IO.
  useEffect(() => {
    const socket = connectSocket(token);
    let connectedBefore = false;

    socket.on('connect', () => {
      setStatus('online');
      if (connectedBefore) {
        // Kết nối lại: có thể đã lỡ tin trong lúc mất mạng, nạp lại.
        loadedRef.current.clear();
        void loadConversations();
        const id = activeIdRef.current;
        if (id) {
          loadedRef.current.add(id);
          void loadMessages(id);
        }
      }
      connectedBefore = true;
    });
    socket.on('disconnect', () => setStatus('offline'));
    socket.on('connect_error', () => setStatus('offline'));
    socket.io.on('reconnect_attempt', () => setStatus('connecting'));

    socket.on('message', (raw: ChatMessage) => {
      const msg = normalize(raw);
      appendMessage(msg);

      if (!conversationsRef.current.some((c) => c.id === msg.conversationId)) {
        void loadConversations(); // hội thoại mới do người khác tạo
      }
      if (msg.conversationId !== activeIdRef.current && !msg.me) {
        setUnread((prev) => ({ ...prev, [msg.conversationId]: (prev[msg.conversationId] ?? 0) + 1 }));
      }
    });

    return () => {
      socket.removeAllListeners();
      socket.io.removeAllListeners();
      socket.disconnect();
    };
  }, [token, normalize, appendMessage, loadConversations, loadMessages]);

  const selectConversation = useCallback(
    (id: string) => {
      activeIdRef.current = id;
      setActiveId(id);
      setUnread((prev) => {
        if (!prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
      if (!loadedRef.current.has(id)) {
        loadedRef.current.add(id);
        void loadMessages(id);
      }
    },
    [loadMessages],
  );

  const closeConversation = useCallback(() => {
    activeIdRef.current = null;
    setActiveId(null);
  }, []);

  const startChat = useCallback(
    async (other: User) => {
      // Backend trả hội thoại cũ nếu hai người đã có, và tự cho người đang online vào room.
      const conv = await chatApi.createDirect(other.id);
      setConversations((prev) => (prev.some((c) => c.id === conv.id) ? prev : [conv, ...prev]));
      selectConversation(conv.id);
    },
    [selectConversation],
  );

  const send = useCallback(
    async (text: string) => {
      const id = activeIdRef.current;
      if (!id) return;
      const res = await chatApi.send(id, text);
      appendMessage(normalize(res));
    },
    [appendMessage, normalize],
  );

  const dismissError = useCallback(() => setError(null), []);

  return {
    conversations,
    messages,
    unread,
    status,
    activeId,
    loadingMessages,
    error,
    selectConversation,
    closeConversation,
    startChat,
    send,
    dismissError,
  };
}

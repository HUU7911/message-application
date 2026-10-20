import { useMemo, useState } from 'react';
import { ProfileDialog } from '../components/ProfileDialog';
import { Sidebar } from '../components/Sidebar';
import { ThreadView } from '../components/ThreadView';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../hooks/useChat';
import type { ConversationItem, User } from '../types';
import { conversationTitle, toMillis } from '../utils';

interface Props {
  token: string;
  me: User;
}

export function ChatPage({ token, me }: Props) {
  const { logout, updateUser } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const chat = useChat(token, me);

  const items = useMemo<ConversationItem[]>(
    () =>
      chat.conversations
        .map((c) => {
          const list = chat.messages[c.id];
          const last = list?.[list.length - 1];
          const other = c.participants.find((p) => p.id !== me.id);
          return {
            id: c.id,
            title: conversationTitle(c, me.id),
            avatar: c.conversationAvatar ?? other?.avatar ?? null,
            preview: last ? `${last.sender?.id === me.id ? 'Bạn: ' : ''}${last.message}` : '',
            time: last ? toMillis(last.createdAt) : toMillis(c.modifiedAt ?? c.createdAt),
            unread: chat.unread[c.id] ?? 0,
          };
        })
        .sort((a, b) => b.time - a.time),
    [chat.conversations, chat.messages, chat.unread, me.id],
  );

  const active = chat.conversations.find((c) => c.id === chat.activeId) ?? null;
  const activeItem = items.find((i) => i.id === chat.activeId) ?? null;

  return (
    <div className="app" data-view={active ? 'thread' : 'list'}>
      <Sidebar
        me={me}
        items={items}
        activeId={chat.activeId}
        status={chat.status}
        onSelect={chat.selectConversation}
        onStartChat={chat.startChat}
        onLogout={() => void logout()}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <main className="stage">
        {chat.status === 'offline' && (
          <div className="banner" role="status">
            Mất kết nối realtime. Tin mới có thể không hiện ngay. Kiểm tra Socket.IO ở cổng 8099 hoặc tải lại trang.
          </div>
        )}

        {active && activeItem ? (
          <ThreadView
            key={active.id}
            title={activeItem.title}
            avatar={activeItem.avatar}
            memberCount={active.participants.length}
            messages={chat.messages[active.id] ?? []}
            meId={me.id}
            loading={chat.loadingMessages}
            onSend={chat.send}
            onBack={chat.closeConversation}
          />
        ) : (
          <div className="stage__empty">
            <h2>Chọn một cuộc trò chuyện</h2>
            <p>Hoặc gõ tên vào ô tìm kiếm bên trái để nhắn cho người mới.</p>
          </div>
        )}

        {chat.error && (
          <div className="toast" role="alert">
            <span>{chat.error}</span>
            <button type="button" onClick={chat.dismissError} aria-label="Đóng thông báo">
              Đóng
            </button>
          </div>
        )}
      </main>

      {profileOpen && <ProfileDialog user={me} onClose={() => setProfileOpen(false)} onUpdated={updateUser} />}
    </div>
  );
}

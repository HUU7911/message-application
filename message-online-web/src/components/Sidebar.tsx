import { useEffect, useState } from 'react';
import { userApi } from '../api';
import { Avatar } from './Avatar';
import type { ConnectionStatus, ConversationItem, User } from '../types';
import { errorMessage, formatShort } from '../utils';

interface Props {
  me: User;
  items: ConversationItem[];
  activeId: string | null;
  status: ConnectionStatus;
  onSelect: (id: string) => void;
  onStartChat: (user: User) => Promise<void>;
  onLogout: () => void;
  onOpenProfile: () => void;
}

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  connecting: 'Đang kết nối…',
  online: 'Trực tuyến',
  offline: 'Mất kết nối',
};

export function Sidebar({ me, items, activeId, status, onSelect, onStartChat, onLogout, onOpenProfile }: Props) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Tìm người dùng (POST /users/search), chờ 300ms sau lần gõ cuối.
  useEffect(() => {
    const q = keyword.trim();
    if (!q) {
      setResults([]);
      setSearching(false);
      setSearchError(null);
      return;
    }
    setSearching(true);
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const list = await userApi.search(q);
        if (!cancelled) {
          setResults((list ?? []).filter((u) => u.id !== me.id));
          setSearchError(null);
        }
      } catch (e) {
        if (!cancelled) setSearchError(errorMessage(e));
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [keyword, me.id]);

  async function pick(user: User) {
    try {
      await onStartChat(user);
      setKeyword('');
    } catch (e) {
      setSearchError(errorMessage(e));
    }
  }

  const isSearching = keyword.trim().length > 0;

  return (
    <aside className="sidebar">
      <header className="sidebar__head">
        <button type="button" className="me" onClick={onOpenProfile} aria-label="Xem hồ sơ của bạn" title="Xem hồ sơ">
          <Avatar name={me.username} src={me.avatar} size={42} />
          <span className="sidebar__me">
            <strong>{me.username}</strong>
            <span className={`status status--${status}`}>
              <i aria-hidden="true" />
              {STATUS_LABEL[status]}
            </span>
          </span>
        </button>
        <button type="button" className="icon-btn" onClick={onLogout} aria-label="Đăng xuất" title="Đăng xuất">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M10 4H5v16h5M15 8l4 4-4 4M19 12H9"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      <div className="search">
        <input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm người để nhắn tin"
          aria-label="Tìm người để nhắn tin"
        />
      </div>

      <div className="list">
        {isSearching ? (
          <>
            {searching && <p className="list__note">Đang tìm…</p>}
            {searchError && (
              <p className="list__note list__note--error" role="alert">
                {searchError}
              </p>
            )}
            {!searching && !searchError && results.length === 0 && (
              <p className="list__note">Không có ai khớp với “{keyword.trim()}”.</p>
            )}
            {results.map((u) => (
              <button type="button" className="conv" key={u.id} onClick={() => void pick(u)}>
                <Avatar name={u.username} src={u.avatar} />
                <span className="conv__body">
                  <span className="conv__top">
                    <span className="conv__title">{u.username}</span>
                  </span>
                  <span className="conv__bottom">
                    <span className="conv__preview">Bắt đầu trò chuyện</span>
                  </span>
                </span>
              </button>
            ))}
          </>
        ) : items.length === 0 ? (
          <p className="list__note">Chưa có cuộc trò chuyện nào. Gõ tên ở ô tìm kiếm để nhắn cho ai đó.</p>
        ) : (
          items.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`conv${item.id === activeId ? ' conv--active' : ''}`}
              onClick={() => onSelect(item.id)}
              aria-current={item.id === activeId ? 'true' : undefined}
            >
              <Avatar name={item.title} src={item.avatar} />
              <span className="conv__body">
                <span className="conv__top">
                  <span className="conv__title">{item.title}</span>
                  <span className="conv__time">{formatShort(item.time)}</span>
                </span>
                <span className="conv__bottom">
                  <span className="conv__preview">{item.preview || 'Chưa có tin nhắn'}</span>
                  {item.unread > 0 && (
                    <span className="badge" aria-label={`${item.unread} tin chưa đọc`}>
                      {item.unread > 99 ? '99+' : item.unread}
                    </span>
                  )}
                </span>
              </span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}

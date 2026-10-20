import { useLayoutEffect, useMemo, useRef } from 'react';
import { Avatar } from './Avatar';
import { Composer } from './Composer';
import type { ChatMessage } from '../types';
import { buildRows, formatTime, toMillis } from '../utils';

interface Props {
  title: string;
  avatar?: string | null;
  memberCount: number;
  messages: ChatMessage[];
  meId: string;
  loading: boolean;
  onSend: (text: string) => Promise<void>;
  onBack: () => void;
}

export function ThreadView({ title, avatar, memberCount, messages, meId, loading, onSend, onBack }: Props) {
  const rows = useMemo(() => buildRows(messages, meId), [messages, meId]);
  const showAuthor = memberCount > 2;

  const listRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);

  function onScroll() {
    const el = listRef.current;
    if (!el) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  // Đang ở cuối thì bám theo tin mới; tin do mình gửi luôn cuộn xuống.
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const last = messages[messages.length - 1];
    if (stickRef.current || last?.sender?.id === meId) el.scrollTop = el.scrollHeight;
  }, [messages, meId]);

  return (
    <section className="thread" aria-label={`Cuộc trò chuyện với ${title}`}>
      <header className="thread__head">
        <button type="button" className="icon-btn thread__back" onClick={onBack} aria-label="Quay lại danh sách">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <Avatar name={title} src={avatar} size={40} />
        <div className="thread__who">
          <h2>{title}</h2>
          {showAuthor && <p>{memberCount} thành viên</p>}
        </div>
      </header>

      <div className="thread__list" ref={listRef} onScroll={onScroll} role="log" aria-live="polite" aria-label="Tin nhắn">
        {rows.length === 0 && (
          <p className="thread__empty">
            {loading ? 'Đang tải tin nhắn…' : 'Chưa có tin nhắn nào. Gửi lời chào đầu tiên.'}
          </p>
        )}

        {rows.map((row) => {
          if (row.kind === 'day') {
            return (
              <div className="day" key={row.key}>
                <span>{row.label}</span>
              </div>
            );
          }
          const { msg, mine, first, last } = row;
          const cls = ['msg', mine ? 'msg--mine' : '', first ? 'msg--first' : 'msg--cont', last ? '' : 'msg--more']
            .filter(Boolean)
            .join(' ');
          return (
            <div className={cls} key={row.key}>
              {!mine && showAuthor && first && <span className="msg__author">{msg.sender?.username}</span>}
              <div className="msg__bubble">{msg.message}</div>
              {last && <time className="msg__time">{formatTime(toMillis(msg.createdAt))}</time>}
            </div>
          );
        })}
      </div>

      <Composer onSend={onSend} />
    </section>
  );
}

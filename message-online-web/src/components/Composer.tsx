import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { errorMessage } from '../utils';

interface Props {
  onSend: (text: string) => Promise<void>;
}

export function Composer({ onSend }: Props) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  // Ô nhập tự giãn theo nội dung, tối đa 140px.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [text]);

  async function submit() {
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setError(null);
    setText('');
    try {
      await onSend(value);
    } catch (e) {
      setText((cur) => cur || value); // gửi lỗi thì trả lại nội dung để người dùng gửi lại
      setError(errorMessage(e));
    } finally {
      setSending(false);
      ref.current?.focus();
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Không gửi khi đang gõ dở bằng bộ gõ tiếng Việt (Telex/VNI): Enter lúc đó là xác nhận chữ.
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  }

  return (
    <div className="composer">
      {error && (
        <p className="composer__error" role="alert">
          {error}
        </p>
      )}
      <form
        className="composer__row"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <textarea
          ref={ref}
          rows={1}
          value={text}
          placeholder="Nhập tin nhắn"
          aria-label="Nhập tin nhắn"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button type="submit" className="send" disabled={!text.trim() || sending} aria-label="Gửi tin nhắn">
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M3.4 20.4 21 12 3.4 3.6l-.1 6.5L15 12 3.3 13.9z" fill="currentColor" />
          </svg>
        </button>
      </form>
      <p className="composer__hint">Enter để gửi, Shift + Enter để xuống dòng</p>
    </div>
  );
}

import type { ChatMessage, Conversation } from './types';

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Đã có lỗi xảy ra. Hãy thử lại.';
}

/** Instant có thể về dạng chuỗi ISO hoặc số giây (Jackson cũ), xử lý cả hai. */
export function toMillis(v: string | number | undefined | null): number {
  if (v === undefined || v === null) return 0;
  if (typeof v === 'number') return v < 1e12 ? v * 1000 : v;
  const t = Date.parse(v);
  return Number.isNaN(t) ? 0 : t;
}

const timeFmt = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' });
const dateFmt = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

export function formatTime(ms: number): string {
  return ms ? timeFmt.format(ms) : '';
}

function dayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function formatDay(ms: number): string {
  const now = Date.now();
  if (dayKey(ms) === dayKey(now)) return 'Hôm nay';
  if (dayKey(ms) === dayKey(now - 86_400_000)) return 'Hôm qua';
  return dateFmt.format(ms);
}

/** Thời gian ngắn gọn cho danh sách hội thoại: giờ nếu hôm nay, ngày nếu cũ hơn. */
export function formatShort(ms: number): string {
  if (!ms) return '';
  return dayKey(ms) === dayKey(Date.now()) ? timeFmt.format(ms) : dateFmt.format(ms).slice(0, 5);
}

export function initials(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => [...w][0] ?? '')
    .join('');
  return letters.toUpperCase() || '?';
}

export function hueFor(name: string): number {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.codePointAt(0)!) % 360;
  return h;
}

export function conversationTitle(c: Conversation, meId: string): string {
  if (c.conversationName) return c.conversationName;
  const others = c.participants.filter((p) => p.id !== meId).map((p) => p.username);
  return others.join(', ') || 'Cuộc trò chuyện';
}

export function mergeMessages(a: ChatMessage[], b: ChatMessage[]): ChatMessage[] {
  const byId = new Map<string, ChatMessage>();
  for (const m of a) byId.set(m.id, m);
  for (const m of b) byId.set(m.id, m);
  return [...byId.values()].sort((x, y) => toMillis(x.createdAt) - toMillis(y.createdAt));
}

export type Row =
  | { kind: 'day'; key: string; label: string }
  | { kind: 'msg'; key: string; msg: ChatMessage; mine: boolean; first: boolean; last: boolean };

const GROUP_GAP_MS = 5 * 60_000;

/** Chèn dải ngày và gom các tin liên tiếp của cùng một người thành nhóm. */
export function buildRows(messages: ChatMessage[], meId: string): Row[] {
  const rows: Row[] = [];
  let prev: ChatMessage | null = null;
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const next = messages[i + 1];
    const t = toMillis(msg.createdAt);
    const newDay = !prev || dayKey(toMillis(prev.createdAt)) !== dayKey(t);
    if (newDay) rows.push({ kind: 'day', key: `day-${msg.id}`, label: formatDay(t) });

    const continuesPrev =
      !!prev && !newDay && prev.sender?.id === msg.sender?.id && t - toMillis(prev.createdAt) < GROUP_GAP_MS;
    const continuesNext =
      !!next &&
      next.sender?.id === msg.sender?.id &&
      dayKey(toMillis(next.createdAt)) === dayKey(t) &&
      toMillis(next.createdAt) - t < GROUP_GAP_MS;

    rows.push({
      kind: 'msg',
      key: msg.id,
      msg,
      mine: msg.sender?.id === meId,
      first: !continuesPrev,
      last: !continuesNext,
    });
    prev = msg;
  }
  return rows;
}

export function formatDate(v: string | number | undefined | null): string {
  const ms = toMillis(v);
  return ms ? dateFmt.format(ms) : '—';
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { chatApi, userApi } from "../api";
import Avatar from "../components/Avatar";
import { useAuth } from "../context/AuthContext";
import { createSocket } from "../lib/socket";
import type { ChatMessage, Conversation, User } from "../types";

const hhmm = (iso: string) => new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
const day = (iso: string) => new Date(iso).toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "numeric" });

export default function ChatPage() {
  const { user, token, isAdmin, logout } = useAuth();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Record<string, ChatMessage[]>>({});
  const [last, setLast] = useState<Record<string, ChatMessage>>({});
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [online, setOnline] = useState(false);
  const [draft, setDraft] = useState("");
  const [keyword, setKeyword] = useState("");
  const [found, setFound] = useState<User[]>([]);
  const [error, setError] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const activeRef = useRef<string | null>(null);
  const convsRef = useRef<Conversation[]>([]);
  activeRef.current = activeId;
  convsRef.current = convs;

  const reloadConvs = useCallback(() => chatApi.conversations().then(setConvs).catch((e: Error) => setError(e.message)), []);
  useEffect(() => { void reloadConvs(); }, [reloadConvs]);

  // Thêm tin nhắn (từ socket hoặc từ response khi gửi); bỏ qua nếu đã có (cùng id)
  const pushMessage = useCallback((m: ChatMessage) => {
    setMsgs((prev) => {
      const list = prev[m.conversationId];
      if (!list || list.some((x) => x.id === m.id)) return prev;
      return { ...prev, [m.conversationId]: [...list, m] };
    });
    setLast((p) => ({ ...p, [m.conversationId]: m }));
    if (!m.me && activeRef.current !== m.conversationId)
      setUnread((p) => ({ ...p, [m.conversationId]: (p[m.conversationId] ?? 0) + 1 }));
    if (!convsRef.current.some((c) => c.id === m.conversationId)) void reloadConvs();
  }, [reloadConvs]);

  // Kết nối Socket.IO. Lưu ý: `me` trong payload socket luôn là true (backend tính theo người gửi),
  // nên phải tự so sánh sender.id với user hiện tại.
  useEffect(() => {
    if (!token || !user) return;
    const s = createSocket(token);
    s.on("connect", () => setOnline(true));
    s.on("disconnect", () => setOnline(false));
    s.on("message", (raw: ChatMessage) => pushMessage({ ...raw, me: raw.sender?.id === user.id }));
    return () => { s.disconnect(); };
  }, [token, user, pushMessage]);

  // Tải lịch sử khi mở một cuộc trò chuyện
  useEffect(() => {
    if (!activeId || msgs[activeId]) return;
    chatApi.messages(activeId).then((list) => {
      setMsgs((p) => ({ ...p, [activeId]: list }));
      if (list.length) setLast((p) => ({ ...p, [activeId]: list[list.length - 1] }));
    }).catch((e: Error) => setError(e.message));
  }, [activeId, msgs]);

  useEffect(() => { bottom.current?.scrollIntoView({ block: "end" }); }, [activeId, msgs]);

  // Tìm người dùng (debounce)
  useEffect(() => {
    const k = keyword.trim();
    if (!k) { setFound([]); return; }
    const t = setTimeout(() => userApi.search(k).then(setFound).catch(() => setFound([])), 300);
    return () => clearTimeout(t);
  }, [keyword]);

  const open = (id: string) => { setActiveId(id); setUnread((p) => ({ ...p, [id]: 0 })); setError(""); };

  async function startChat(u: User) {
    try {
      const c = await chatApi.create(u.id);
      setConvs((p) => (p.some((x) => x.id === c.id) ? p : [c, ...p]));
      setKeyword(""); setFound([]);
      open(c.id);
    } catch (e) { setError(e instanceof Error ? e.message : "Không tạo được cuộc trò chuyện"); }
  }

  async function send() {
    const text = draft.trim();
    if (!text || !activeId) return;
    setDraft("");
    try {
      pushMessage({ ...(await chatApi.send(activeId, text)), me: true });
    } catch (e) {
      setDraft(text);
      setError(e instanceof Error ? e.message : "Không gửi được tin nhắn");
    }
  }

  const sorted = useMemo(() => {
    const t = (c: Conversation) => last[c.id]?.createdAt ?? c.modifiedAt ?? "";
    return [...convs].sort((a, b) => t(b).localeCompare(t(a)));
  }, [convs, last]);

  const active = convs.find((c) => c.id === activeId);
  const list = activeId ? msgs[activeId] : undefined;

  return (
    <div className={`chat ${activeId ? "has-active" : ""}`}>
      <aside className="side">
        <header className="side-head">
          <Link to="/profile" className="me" title="Hồ sơ">
            <Avatar src={user?.avatar} name={user?.username} size={36} />
            <span>{user?.username}</span>
          </Link>
          <span className={online ? "dot on" : "dot"} title={online ? "Đã kết nối realtime" : "Mất kết nối realtime"} />
          {isAdmin && <Link to="/admin" className="link">Quản trị</Link>}
          <button className="link" onClick={() => logout()}>Đăng xuất</button>
        </header>

        <input className="search" placeholder="Tìm người để nhắn tin" value={keyword} onChange={(e) => setKeyword(e.target.value)} />

        <ul className="convs">
          {keyword.trim() ? (
            found.length ? found.map((u) => (
              <li key={u.id}><button onClick={() => startChat(u)}><Avatar src={u.avatar} name={u.username} /><b>{u.username}</b></button></li>
            )) : <li className="muted pad">Không tìm thấy người dùng</li>
          ) : sorted.length ? sorted.map((c) => (
            <li key={c.id}>
              <button className={c.id === activeId ? "on" : ""} onClick={() => open(c.id)}>
                <Avatar src={c.conversationAvatar} name={c.conversationName} />
                <span className="meta">
                  <b>{c.conversationName}</b>
                  <small>{last[c.id] ? `${last[c.id].me ? "Bạn: " : ""}${last[c.id].message}` : ""}</small>
                </span>
                {!!unread[c.id] && <span className="badge">{unread[c.id]}</span>}
              </button>
            </li>
          )) : <li className="muted pad">Chưa có cuộc trò chuyện. Tìm một người ở ô phía trên để bắt đầu.</li>}
        </ul>
      </aside>

      <section className="thread">
        {active ? (
          <>
            <header className="thread-head">
              <button className="link back-btn" onClick={() => setActiveId(null)}>←</button>
              <Avatar src={active.conversationAvatar} name={active.conversationName} size={36} />
              <b>{active.conversationName}</b>
            </header>
            <div className="messages">
              {!list ? <p className="muted center">Đang tải tin nhắn…</p> : !list.length ? <p className="muted center">Chưa có tin nhắn. Hãy gửi lời chào.</p> : list.map((m, i) => (
                <div key={m.id}>
                  {(i === 0 || day(list[i - 1].createdAt) !== day(m.createdAt)) && <div className="day">{day(m.createdAt)}</div>}
                  <div className={m.me ? "msg me" : "msg"}>
                    {!m.me && <Avatar src={m.sender.avatar} name={m.sender.username} size={28} />}
                    <div className="bubble">{m.message}<time>{hhmm(m.createdAt)}</time></div>
                  </div>
                </div>
              ))}
              <div ref={bottom} />
            </div>
            {error && <p className="error pad" role="alert">{error}</p>}
            <form className="composer" onSubmit={(e) => { e.preventDefault(); void send(); }}>
              <textarea rows={1} value={draft} placeholder="Nhập tin nhắn…" onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(); } }} />
              <button className="btn primary" disabled={!draft.trim()}>Gửi</button>
            </form>
          </>
        ) : (
          <div className="center muted empty">Chọn một cuộc trò chuyện hoặc tìm người để bắt đầu nhắn tin.</div>
        )}
      </section>
    </div>
  );
}

import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { userApi } from "../api";
import Avatar from "../components/Avatar";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save(e: FormEvent) {
    e.preventDefault();
    try {
      const body: { username: string; email: string; password?: string } = { username, email };
      if (password) body.password = password;
      setUser(await userApi.update(body));
      setPassword("");
      setMsg({ ok: true, text: "Đã lưu thay đổi" });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Không lưu được" });
    }
  }

  async function pickAvatar(file?: File) {
    if (!file) return;
    try {
      setUser(await userApi.avatar(file));
      setMsg({ ok: true, text: "Đã cập nhật ảnh đại diện" });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Không tải được ảnh" });
    }
  }

  if (!user) return null;
  return (
    <main className="page">
      <Link to="/" className="back">← Quay lại tin nhắn</Link>
      <h1>Hồ sơ</h1>
      <div className="profile-head">
        <Avatar src={user.avatar} name={user.username} size={84} />
        <label className="btn">
          Đổi ảnh đại diện
          <input type="file" accept="image/*" hidden onChange={(e) => pickAvatar(e.target.files?.[0])} />
        </label>
      </div>
      <form className="form" onSubmit={save}>
        <label>Tên hiển thị<input value={username} onChange={(e) => setUsername(e.target.value)} required /></label>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Mật khẩu mới<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Để trống nếu không đổi" /></label>
        {msg && <p className={msg.ok ? "ok" : "error"} role="status">{msg.text}</p>}
        <div className="row">
          <button className="btn primary">Lưu thay đổi</button>
          <button type="button" className="btn" onClick={() => logout()}>Đăng xuất</button>
        </div>
      </form>
    </main>
  );
}

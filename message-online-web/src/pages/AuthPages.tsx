import { useState, type FormEvent, type ReactNode } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { authApi, userApi } from "../api";
import { useAuth } from "../context/AuthContext";

const GOOGLE_CLIENT_ID: string = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
const GOOGLE_REDIRECT: string = import.meta.env.VITE_GOOGLE_REDIRECT_URI ?? "http://localhost:5173/authenticate";

function googleUrl() {
  const p = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT,
    response_type: "code",
    scope: "openid email profile",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
}

function Shell({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <main className="auth">
      <section className="auth-card">
        <h1 className="brand">Message Online</h1>
        <h2>{title}</h2>
        {children}
        <p className="muted small">{footer}</p>
      </section>
    </main>
  );
}

export function LoginPage() {
  const { token, login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (token) return <Navigate to="/" replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await authApi.login(username.trim(), password);
      await login(res.token);
      nav("/", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell title="Đăng nhập" footer={<>Chưa có tài khoản? <Link to="/register">Đăng ký</Link></>}>
      <form onSubmit={submit} className="form">
        <label>Tên đăng nhập<input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required /></label>
        <label>Mật khẩu<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn primary" disabled={busy}>{busy ? "Đang đăng nhập…" : "Đăng nhập"}</button>
      </form>
      {GOOGLE_CLIENT_ID && (
        <a className="btn" href={googleUrl()}>Đăng nhập bằng Google</a>
      )}
    </Shell>
  );
}

export function RegisterPage() {
  const nav = useNavigate();
  const [f, setF] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await userApi.register({ ...f, username: f.username.trim() });
      nav("/login", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell title="Tạo tài khoản" footer={<>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></>}>
      <form onSubmit={submit} className="form">
        <label>Tên đăng nhập<input value={f.username} onChange={set("username")} minLength={3} required /></label>
        <label>Email<input type="email" value={f.email} onChange={set("email")} required /></label>
        <label>Mật khẩu<input type="password" value={f.password} onChange={set("password")} minLength={4} required /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn primary" disabled={busy}>{busy ? "Đang tạo…" : "Tạo tài khoản"}</button>
      </form>
    </Shell>
  );
}

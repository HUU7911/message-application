import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../api";
import { useAuth } from "../context/AuthContext";

/** Google redirect về /authenticate?code=... → đổi code lấy JWT từ backend. */
export default function GoogleCallback() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const nav = useNavigate();
  const [error, setError] = useState("");
  const done = useRef(false); // StrictMode chạy effect 2 lần, nhưng code chỉ dùng được 1 lần

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const code = params.get("code");
    if (!code) { setError("Thiếu mã xác thực từ Google"); return; }
    authApi.google(code)
      .then((r) => login(r.token))
      .then(() => nav("/", { replace: true }))
      .catch((e: Error) => setError(e.message));
  }, [params, login, nav]);

  return (
    <main className="auth">
      <section className="auth-card">
        {error ? (<><p className="error">{error}</p><Link to="/login">Quay lại đăng nhập</Link></>) : <p className="muted">Đang đăng nhập bằng Google…</p>}
      </section>
    </main>
  );
}

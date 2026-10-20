import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../utils';

type Mode = 'login' | 'register';

export function LoginPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      if (mode === 'login') await login(username.trim(), password);
      else await register(username.trim(), email.trim(), password);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth__art" aria-hidden="true">
        <h1>Message Online</h1>
        <div className="demo">
          <p className="demo__bubble">Tối nay họp lúc mấy giờ?</p>
          <p className="demo__bubble demo__bubble--mine">7 giờ, phòng nhỏ tầng 3.</p>
          <p className="demo__bubble">Ok, mình tới sớm.</p>
        </div>
      </div>

      <main className="auth__panel">
        <form className="auth__form" onSubmit={onSubmit}>
          <h2>{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</h2>

          <label>
            Tên đăng nhập
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              minLength={3}
              required
              autoFocus
            />
          </label>

          {mode === 'register' && (
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
            </label>
          )}

          <label>
            Mật khẩu
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </label>

          {error && (
            <p className="auth__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="primary" disabled={busy}>
            {busy ? 'Đang xử lý…' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </button>

          <p className="auth__switch">
            {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
            <button type="button" className="link" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>
              {mode === 'login' ? 'Tạo tài khoản' : 'Đăng nhập'}
            </button>
          </p>
        </form>
      </main>
    </div>
  );
}

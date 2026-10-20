import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { userApi } from '../api';
import { PROFILE_EDIT_ENABLED } from '../config';
import { squareAvatarBlob } from '../imageUtils';
import type { User } from '../types';
import { errorMessage, formatDate } from '../utils';
import { Avatar } from './Avatar';

interface Props {
  user: User;
  onClose: () => void;
  onUpdated: (user: User) => void;
}

interface PendingAvatar {
  blob: Blob;
  url: string;
}

export function ProfileDialog({ user, onClose, onUpdated }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingAvatar | null>(null);
  const [email, setEmail] = useState(user.email ?? '');
  const [busy, setBusy] = useState<'avatar' | 'profile' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // <dialog> gốc lo sẵn khoá tiêu điểm, phím Esc và lớp nền mờ.
  useEffect(() => {
    const d = dialogRef.current;
    if (d && !d.open) d.showModal();
  }, []);

  useEffect(() => {
    const url = pending?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [pending]);

  function close() {
    dialogRef.current?.close();
  }

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // cho phép chọn lại cùng một tệp
    if (!file) return;
    setError(null);
    setNotice(null);
    try {
      const blob = await squareAvatarBlob(file);
      setPending({ blob, url: URL.createObjectURL(blob) });
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function saveAvatar() {
    if (!pending || busy) return;
    setBusy('avatar');
    setError(null);
    try {
      const updated = await userApi.updateAvatar(pending.blob);
      onUpdated({ ...user, ...updated });
      setPending(null);
      setNotice('Đã cập nhật ảnh đại diện.');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function saveProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy('profile');
    setError(null);
    setNotice(null);
    try {
      const updated = await userApi.updateProfile({ email: email.trim() });
      onUpdated({ ...user, ...updated });
      setNotice('Đã lưu thay đổi.');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  const emailChanged = email.trim() !== (user.email ?? '');

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby="profile-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) close(); // bấm vào lớp nền
      }}
    >
      <div className="dialog__body">
        <header className="dialog__head">
          <h2 id="profile-title">Hồ sơ của bạn</h2>
          <button type="button" className="icon-btn" onClick={close} aria-label="Đóng">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="profile__avatar">
          <Avatar name={user.username} src={pending ? pending.url : user.avatar} size={104} />
          <div className="profile__actions">
            {pending ? (
              <>
                <button type="button" className="primary" onClick={() => void saveAvatar()} disabled={busy === 'avatar'}>
                  {busy === 'avatar' ? 'Đang tải lên…' : 'Lưu ảnh'}
                </button>
                <button type="button" className="secondary" onClick={() => setPending(null)} disabled={busy === 'avatar'}>
                  Hủy
                </button>
              </>
            ) : (
              <button type="button" className="secondary" onClick={() => fileRef.current?.click()}>
                Đổi ảnh đại diện
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={onPick} />
          </div>
          <p className="profile__hint">Ảnh được cắt vuông và thu nhỏ trước khi tải lên.</p>
        </div>

        {error && (
          <p className="auth__error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="notice" role="status">
            {notice}
          </p>
        )}

        <form className="profile__fields" onSubmit={saveProfile}>
          <div className="field">
            <span className="field__label">Tên đăng nhập</span>
            <span className="field__value">{user.username}</span>
          </div>

          {PROFILE_EDIT_ENABLED ? (
            <label className="field">
              <span className="field__label">Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
          ) : (
            <div className="field">
              <span className="field__label">Email</span>
              <span className="field__value">{user.email || '—'}</span>
            </div>
          )}

          <div className="field">
            <span className="field__label">Ngày tham gia</span>
            <span className="field__value">{formatDate(user.createdAt)}</span>
          </div>

          {PROFILE_EDIT_ENABLED && (
            <button type="submit" className="primary" disabled={!emailChanged || busy === 'profile'}>
              {busy === 'profile' ? 'Đang lưu…' : 'Lưu thay đổi'}
            </button>
          )}
        </form>
      </div>
    </dialog>
  );
}

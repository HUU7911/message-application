import { tokenStore } from "../api/client";

/**
 * /media/download/** yêu cầu Bearer token nên <img src> thường sẽ bị 401.
 * Ta tải ảnh bằng fetch kèm token rồi dùng object URL (có cache theo URL).
 * Backend sinh URL dạng ".../message/file/media/download/x" trong khi route thật là
 * ".../message/media/download/x" nên cần chuẩn hóa lại.
 */
const cache = new Map<string, Promise<string>>();

export const normalizeMediaUrl = (url: string) => url.replace("/file/media/", "/media/");

export function loadMedia(url: string): Promise<string> {
  const fixed = normalizeMediaUrl(url);
  let p = cache.get(fixed);
  if (!p) {
    p = fetch(fixed, { headers: { Authorization: `Bearer ${tokenStore.get() ?? ""}` } })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.blob();
      })
      .then((b) => URL.createObjectURL(b));
    p.catch(() => cache.delete(fixed));
    cache.set(fixed, p);
  }
  return p;
}

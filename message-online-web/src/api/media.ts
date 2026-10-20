import { API_URL } from '../config';
import { getAuthToken } from './http';

// GET /media/download/{filename} yêu cầu đăng nhập, nên thẻ <img src> trần sẽ bị 401.
// Tải ảnh bằng fetch kèm token rồi đổi thành blob URL; cache để không tải lại mỗi lần render.
const pending = new Map<string, Promise<string | null>>();
const resolved = new Set<string>();

/** Lấy tên tệp từ URL đã lưu rồi trỏ vào đúng route của FileController (/media/download/{filename}). */
function downloadUrl(src: string): string {
  const name = src.split(/[?#]/)[0].split('/').filter(Boolean).pop() ?? '';
  return `${API_URL}/media/download/${encodeURIComponent(name)}`;
}

async function fetchImage(src: string): Promise<string | null> {
  try {
    const token = getAuthToken();
    const res = await fetch(downloadUrl(src), { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type.startsWith('image/')) return null;
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export function loadProtectedImage(src: string): Promise<string | null> {
  if (src.startsWith('blob:') || src.startsWith('data:')) return Promise.resolve(src);
  let p = pending.get(src);
  if (!p) {
    p = fetchImage(src).then((url) => {
      if (url) resolved.add(url);
      else pending.delete(src); // lần sau thử lại
      return url;
    });
    pending.set(src, p);
  }
  return p;
}

export function clearImageCache() {
  for (const url of resolved) URL.revokeObjectURL(url);
  resolved.clear();
  pending.clear();
}

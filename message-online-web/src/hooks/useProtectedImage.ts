import { useEffect, useState } from 'react';
import { loadProtectedImage } from '../api/media';

/** Trả về URL dùng được cho <img> (blob URL), hoặc null khi chưa có / tải lỗi. */
export function useProtectedImage(src?: string | null): string | null {
  const [state, setState] = useState<{ src: string; url: string | null } | null>(null);

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    void loadProtectedImage(src).then((url) => {
      if (!cancelled) setState({ src, url });
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  return src && state?.src === src ? state.url : null;
}

import { useEffect, useState } from "react";
import { loadMedia } from "../lib/media";

const hue = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);

export default function Avatar({ src, name, size = 40 }: { src?: string | null; name?: string; size?: number }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setUrl(null);
    if (!src) return;
    // Ảnh ngoài (vd. avatar Google) dùng trực tiếp, ảnh của backend phải tải kèm token
    if (!src.includes("/media/download/")) { setUrl(src); return; }
    loadMedia(src).then((u) => alive && setUrl(u)).catch(() => undefined);
    return () => { alive = false; };
  }, [src]);

  const label = (name ?? "?").trim().charAt(0).toUpperCase() || "?";
  return url ? (
    <img className="avatar" src={url} alt={name} style={{ width: size, height: size }} referrerPolicy="no-referrer" />
  ) : (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.42, background: `hsl(${hue(name ?? "?")} 45% 42%)` }}>
      {label}
    </span>
  );
}

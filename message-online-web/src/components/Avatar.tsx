import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useProtectedImage } from '../hooks/useProtectedImage';
import { hueFor, initials } from '../utils';

interface Props {
  name: string;
  src?: string | null;
  size?: number;
}

export function Avatar({ name, src, size = 40 }: Props) {
  const url = useProtectedImage(src);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = !!url && failedUrl !== url;
  const style = { width: size, height: size, fontSize: size * 0.38, '--hue': hueFor(name) } as CSSProperties;

  return (
    <span className="avatar" style={style} aria-hidden="true">
      {showImage ? <img src={url} alt="" onError={() => setFailedUrl(url)} /> : initials(name)}
    </span>
  );
}

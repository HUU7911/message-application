interface JwtPayload { sub: string; scope?: string; exp?: number }

export function decodeJwt(token: string | null): JwtPayload | null {
  if (!token) return null;
  try {
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(atob(b64)))) as JwtPayload;
  } catch {
    return null;
  }
}

export const hasScope = (token: string | null, scope: string) =>
  (decodeJwt(token)?.scope ?? "").split(" ").includes(scope);

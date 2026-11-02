import type { ApiResponse } from "../types";

export const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8080/message";

const TOKEN_KEY = "mo_token";
export const tokenStore = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (t: string) => sessionStorage.setItem(TOKEN_KEY, t),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
};

let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: (() => void) | null) => {
  onUnauthorized = fn;
};

export class ApiError extends Error {
  constructor(public code: number, message: string, public status: number) {
    super(message);
  }
}

interface Options {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  form?: FormData;
  query?: Record<string, string>;
  /** false cho các endpoint public (login, register) */
  auth?: boolean;
}

export async function request<T>(path: string, opts: Options = {}): Promise<T> {
  const { method = "GET", body, form, query, auth = true } = opts;
  const url = new URL(API_URL + path);
  if (query) Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));

  const headers: Record<string, string> = {};
  const token = tokenStore.get();
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new ApiError(0, "Không kết nối được tới máy chủ", 0);
  }

  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;

  if (res.status === 401 && auth) onUnauthorized?.();
  if (!res.ok || (json && json.code !== undefined && json.code !== 1000)) {
    throw new ApiError(json?.code ?? res.status, json?.message ?? `Lỗi ${res.status}`, res.status);
  }
  return json?.results as T;
}

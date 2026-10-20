import { API_URL } from '../config';
import type { ApiResponse } from '../types';

export class ApiError extends Error {
  readonly status: number;
  readonly code?: number;

  constructor(message: string, status: number, code?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

let currentToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  currentToken = token;
}

export function getAuthToken(): string | null {
  return currentToken;
}

export function onUnauthorized(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

interface Options {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
}

/** Gọi REST và bóc `results` từ ApiResponse<T> của backend. */
export async function request<T>(path: string, { method = 'GET', body, auth = true }: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  let payloadBody: BodyInit | undefined;
  if (body instanceof FormData) {
    payloadBody = body; // trình duyệt tự đặt Content-Type multipart kèm boundary
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payloadBody = JSON.stringify(body);
  }
  if (auth && currentToken) headers.Authorization = `Bearer ${currentToken}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: payloadBody,
    });
  } catch {
    throw new ApiError('Không kết nối được máy chủ. Kiểm tra backend đã chạy ở cổng 8080 chưa.', 0);
  }

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await res.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (res.status === 401 && auth) unauthorizedHandler?.();

  if (!res.ok || (payload && payload.code !== undefined && payload.code !== 1000)) {
    throw new ApiError(payload?.message ?? `Yêu cầu thất bại (${res.status})`, res.status, payload?.code);
  }
  return payload?.results as T;
}

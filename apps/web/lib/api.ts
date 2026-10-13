// Tiny API client for the HCR dashboard.
// Uses NEXT_PUBLIC_API_URL in production, falls back to localhost for local dev.
// Never throws — returns { ok, status, data } so the UI always renders.
// Sends the stored JWT (from POST /auth/login) so authenticated routes work.
const BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  'http://localhost:4000/api';

const TOKEN_KEY = 'hcr_auth_token';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable — requests just go unauthenticated */
  }
}

function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = getAuthToken();
  const base: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) base.Authorization = `Bearer ${token}`;
  return { ...base, ...(extra as Record<string, string> | undefined) };
}

export interface ApiResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
  ms: number;
}

export async function apiGet<T = unknown>(path: string, signal?: AbortSignal): Promise<ApiResult<T>> {
  const started = Date.now();
  try {
    const headers = getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : undefined;
    const res = await fetch(`${BASE}${path}`, { cache: 'no-store', headers, signal });
    const text = await res.text();
    let data: T | null = null;
    try {
      data = text ? (JSON.parse(text) as T) : null;
    } catch {
      data = text as unknown as T;
    }
    return { ok: res.ok, status: res.status, data, error: res.ok ? null : `HTTP ${res.status}`, ms: Date.now() - started };
  } catch (e) {
    return { ok: false, status: 0, data: null, error: e instanceof Error ? e.message : 'network error', ms: Date.now() - started };
  }
}

export async function apiPost<T = unknown>(path: string, body: unknown): Promise<ApiResult<T>> {
  return apiSend<T>(path, { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
}

export async function apiPut<T = unknown>(path: string, body: unknown): Promise<ApiResult<T>> {
  return apiSend<T>(path, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
}

export async function apiDelete<T = unknown>(path: string): Promise<ApiResult<T>> {
  const headers = getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : undefined;
  return apiSend<T>(path, { method: 'DELETE', headers });
}

async function apiSend<T = unknown>(path: string, init: RequestInit): Promise<ApiResult<T>> {
  const started = Date.now();
  try {
    const res = await fetch(`${BASE}${path}`, init);
    const text = await res.text();
    let data: T | null = null;
    try {
      data = text ? (JSON.parse(text) as T) : null;
    } catch {
      data = text as unknown as T;
    }
    return { ok: res.ok, status: res.status, data, error: res.ok ? null : `HTTP ${res.status}`, ms: Date.now() - started };
  } catch (e) {
    return { ok: false, status: 0, data: null, error: e instanceof Error ? e.message : 'network error', ms: Date.now() - started };
  }
}

export function apiBase(): string {
  return BASE;
}

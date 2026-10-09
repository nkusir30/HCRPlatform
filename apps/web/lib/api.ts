// Tiny API client for the HCR dashboard.
// Uses NEXT_PUBLIC_API_URL in production, falls back to localhost for local dev.
// Never throws — returns { ok, status, data } so the UI always renders.
const BASE =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  'http://localhost:4000/api';

export interface ApiResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
  ms: number;
}

export async function apiGet<T = unknown>(path: string): Promise<ApiResult<T>> {
  const started = Date.now();
  try {
    const res = await fetch(`${BASE}${path}`, { cache: 'no-store' });
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
  const started = Date.now();
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
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

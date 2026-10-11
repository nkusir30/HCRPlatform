import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Local (not UTC) YYYY-MM-DD for a Date — matches how a shift "day" is perceived
// by staff on site, independent of timezone offsets.
export function localDateISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 12-hour clock label for an ISO timestamp, e.g. "7:05 AM".
export function formatClock(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// "8h 12m" style duration between two ISO timestamps (or ms). Falls back to "—".
export function formatDuration(fromIso: string | null, toIso: string | number | null): string {
  if (!fromIso || toIso == null) return '—';
  const start = new Date(fromIso).getTime();
  const end = typeof toIso === 'number' ? toIso : new Date(toIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return '—';
  const mins = Math.floor((end - start) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

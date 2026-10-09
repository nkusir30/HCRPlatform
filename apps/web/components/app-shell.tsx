'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useApp } from '@/lib/app-store';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/schedules', label: 'Schedules', icon: '🗓️' },
  { href: '/timesheets', label: 'Timesheets', icon: '⏱️' },
  { href: '/employees', label: 'Employees', icon: '👥' },
  { href: '/houses', label: 'Houses', icon: '🏠' },
  { href: '/programs', label: 'Programs', icon: '🧩' },
  { href: '/reports', label: 'Reports', icon: '📄' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { session, hydrated, logout } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  // Until the client has read localStorage, render a neutral state that matches
  // the server (no session) so hydration succeeds. Then enforce the auth guard.
  useEffect(() => {
    if (hydrated && !session && pathname !== '/login') router.replace('/login');
  }, [hydrated, session, pathname, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-[var(--color-text-secondary)]">
        Loading…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-[var(--color-text-secondary)]">
        Redirecting to sign in…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-64 bg-[var(--color-bg-elevated)] border-b md:border-b-0 md:border-r border-[var(--color-border)] md:min-h-screen">
        <div className="p-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <div>
              <div className="font-semibold">HCR Platform</div>
              <div className="text-xs text-[var(--color-text-muted)]">Scheduling &amp; Payroll</div>
            </div>
          </div>
        </div>
        <nav className="p-3 flex md:flex-col gap-1 overflow-x-auto">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)]'
                }`}
              >
                <span aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-4 border-t border-[var(--color-border)] hidden md:block">
          <div className="text-sm font-medium">{session.name}</div>
          <div className="text-xs text-[var(--color-text-muted)] capitalize">{session.role.replace('_', ' ')}</div>
          <button
            onClick={() => {
              logout();
              router.replace('/login');
            }}
            className="mt-3 text-xs text-[var(--color-danger)] hover:underline"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

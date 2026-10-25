'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { useApp } from '@/lib/app-store';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  FileSpreadsheet,
  Users,
  Home,
  Layers,
  BarChart3,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/attendance', label: 'Time & Attendance', icon: Clock },
  { href: '/schedules', label: 'Schedules', icon: CalendarDays },
  { href: '/timesheets', label: 'Timesheets', icon: FileSpreadsheet },
  { href: '/employees', label: 'Employees', icon: Users },
  { href: '/houses', label: 'Houses', icon: Home },
  { href: '/programs', label: 'Programs', icon: Layers },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { session, hydrated, logout, syncStatus, lastSyncError } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on page transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const syncBadge =
    syncStatus === 'synced' ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Server synced
      </span>
    ) : syncStatus === 'syncing' ? (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
        <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" /> Saving…
      </span>
    ) : syncStatus === 'local-only' ? (
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 text-[11px] font-medium text-red-700"
        title={lastSyncError ?? 'Edits saved locally — server offline'}
      >
        <AlertTriangle className="w-3 h-3 text-red-600" /> Device only
      </span>
    ) : null;

  useEffect(() => {
    if (!hydrated) return;
    if (!session || session.role === 'employee') {
      if (pathname !== '/login') router.replace('/login');
    }
  }, [hydrated, session, pathname, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] gap-3">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm">Loading workspace…</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[var(--color-bg-base)] text-[var(--color-text-secondary)]">
        Redirecting to sign in…
      </div>
    );
  }

  if (session.role === 'employee') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[var(--color-bg-base)] text-[var(--color-text-secondary)]">
        Redirecting to your time clock…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--color-bg-base)]">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xs">
            HCR
          </div>
          <div>
            <div className="font-semibold text-xs text-[var(--color-text-primary)]">Home Care Residential</div>
            <div className="text-[10px] text-[var(--color-text-muted)]">Payroll &amp; HR SaaS</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {syncBadge}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)]"
            aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Nav Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[57px] bottom-0 bg-slate-900/60 backdrop-blur-sm z-30 animate-fadeIn">
          <div className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] p-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-[var(--color-text-primary)]">{session.name}</div>
                <div className="text-xs text-[var(--color-text-muted)] capitalize">{session.role.replace('_', ' ')}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.replace('/login');
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg px-3 py-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col bg-[var(--color-bg-elevated)] border-r border-[var(--color-border)] min-h-screen sticky top-0 h-screen overflow-y-auto">
        <div className="p-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[var(--color-primary)] to-teal-400 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-teal-500/20">
              HCR
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-[var(--color-text-primary)]">
                Home Care Residential
              </div>
              <div className="text-[11px] text-[var(--color-text-muted)]">Scheduling &amp; Payroll SaaS</div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            {syncBadge}
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
              Sec 21
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 flex-1 flex flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] shadow-xs font-semibold'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[var(--color-primary)]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Sign Out */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-surface)]/60">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="text-xs font-bold text-[var(--color-text-primary)] truncate">{session.name}</div>
              <div className="text-[11px] text-[var(--color-text-muted)] capitalize truncate">
                {session.role.replace('_', ' ')}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace('/login');
              }}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Page Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}

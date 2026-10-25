'use client';

import Link from 'next/link';
import { useApp } from '@/lib/app-store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  CalendarDays,
  FileSpreadsheet,
  BarChart3,
  Clock,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

function Stat({
  label,
  value,
  href,
  icon: Icon,
  trend,
}: {
  label: string;
  value: number | string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
}) {
  return (
    <Link href={href}>
      <Card variant="elevated" className="card-hover h-full transition-all group hover:border-teal-500/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</CardTitle>
            <div className="p-2 rounded-xl bg-[var(--color-border-subtle)] text-[var(--color-primary)] group-hover:bg-[var(--color-primary-light)] transition-colors">
              <Icon className="w-5 h-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-extrabold text-[var(--color-text-primary)]">{value}</div>
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mt-1.5">
            <span>{trend ?? 'Live synced'}</span>
            <span className="text-[var(--color-primary)] font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Manage <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const { session, employees, schedules, timesheets, reports, attendance } = useApp();
  const pendingTs = timesheets.filter((t) => t.status !== 'approved').length;
  const onTheClock = attendance.filter((a) => a.status === 'clocked-in').length;
  const firstName = session?.name.split(' ')[0] ?? 'there';

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Section 21 Facility Provider
            </span>
            {onTheClock > 0 && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {onTheClock} staff active on duty
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mt-1.5">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Direct-care operations, live EVV punches, and payroll verification at a glance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/attendance"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[var(--color-primary-hover)] shadow-xs transition-colors"
          >
            <Clock className="w-4 h-4" />
            <span>EVV Time Console</span>
          </Link>
        </div>
      </header>

      {/* Primary KPI Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Staff Roster" value={employees.length} href="/employees" icon={Users} trend="Active care staff" />
        <Stat label="Weekly Shifts" value={schedules.length} href="/schedules" icon={CalendarDays} trend="Across all homes" />
        <Stat label="Logged Timesheets" value={timesheets.length} href="/timesheets" icon={FileSpreadsheet} trend={`${pendingTs} awaiting review`} />
        <Stat label="Payroll Reports" value={reports.length} href="/reports" icon={BarChart3} trend="Audited summaries" />
      </section>

      {/* Review & Quick Actions */}
      <section className="grid gap-6 md:grid-cols-2">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-base">Timesheets Needing Review</CardTitle>
            <CardDescription>Submitted care entries pending supervisor approval for payroll.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <Badge variant={pendingTs > 0 ? 'warning' : 'success'} size="md">
                  {pendingTs} pending approval
                </Badge>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {pendingTs === 0 ? 'All timesheets up to date' : 'Ready for verification'}
                </span>
              </div>
              <Link
                href="/timesheets"
                className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
              >
                <span>Open timesheets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Approved entries flow into automated bi-weekly payroll and Section 21 reporting.</span>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-base">Operations Quick Actions</CardTitle>
            <CardDescription>Direct navigation into core management workflows.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2.5">
            <Link
              href="/schedules"
              className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] p-3 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] hover:border-teal-500/30 transition-all"
            >
              <Plus className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Schedule Shift</span>
            </Link>
            <Link
              href="/timesheets"
              className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] p-3 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] hover:border-teal-500/30 transition-all"
            >
              <Plus className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Log Care Time</span>
            </Link>
            <Link
              href="/employees"
              className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] p-3 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] hover:border-teal-500/30 transition-all"
            >
              <Plus className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Add Employee</span>
            </Link>
            <Link
              href="/reports"
              className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] p-3 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] hover:border-teal-500/30 transition-all"
            >
              <Plus className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Request Report</span>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

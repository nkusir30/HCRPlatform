'use client';

import Link from 'next/link';
import { useApp } from '@/lib/app-store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function Stat({ label, value, href, icon }: { label: string; value: number | string; href: string; icon: string }) {
  return (
    <Link href={href}>
      <Card variant="elevated" className="card-hover h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{label}</CardTitle>
            <span className="text-2xl" aria-hidden>{icon}</span>
          </div>
          <CardDescription>View &amp; manage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold">{value}</div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const { session, employees, schedules, timesheets, reports } = useApp();
  const pendingTs = timesheets.filter((t) => t.status !== 'approved').length;
  const firstName = session?.name.split(' ')[0] ?? 'there';

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto flex flex-col gap-6">
      <header>
        <p className="text-sm text-[var(--color-text-secondary)]">Welcome back, {firstName}</p>
        <h1 className="text-3xl font-semibold">Operations overview</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Live counts from your scheduling data. Create records and they update here instantly.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Employees" value={employees.length} href="/employees" icon="👥" />
        <Stat label="Schedules" value={schedules.length} href="/schedules" icon="🗓️" />
        <Stat label="Timesheets" value={timesheets.length} href="/timesheets" icon="⏱️" />
        <Stat label="Reports" value={reports.length} href="/reports" icon="📄" />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Timesheets needing review</CardTitle>
            <CardDescription>Draft or submitted, not yet approved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge variant={pendingTs > 0 ? 'warning' : 'success'}>{pendingTs} pending</Badge>
              <Link href="/timesheets" className="text-sm underline underline-offset-4">Open timesheets</Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Jump into a workflow</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link href="/schedules" className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm hover:bg-[var(--color-border-subtle)]">+ New schedule</Link>
            <Link href="/timesheets" className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm hover:bg-[var(--color-border-subtle)]">+ Log time</Link>
            <Link href="/employees" className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm hover:bg-[var(--color-border-subtle)]">+ Add employee</Link>
            <Link href="/reports" className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm hover:bg-[var(--color-border-subtle)]">+ Request report</Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

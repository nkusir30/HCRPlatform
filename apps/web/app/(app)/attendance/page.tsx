'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/app-store';
import type { Attendance } from '@/lib/types';
import { AttendanceClock } from '@/components/attendance-clock';
import { formatClock, formatDuration } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/form';
import { Download, Filter, Clock } from 'lucide-react';

export default function AttendancePage() {
  const { session, employees, schedules, houses, attendance } = useApp();
  const [statusFilter, setStatusFilter] = useState<'all' | 'clocked-in' | 'clocked-out'>('all');

  // Non-employees see the whole org; an employee sees only their own punches.
  const isEmployee = session?.role === 'employee';
  const me = useMemo(() => {
    if (!session) return undefined;
    const email = session.email.toLowerCase();
    return employees.find((e) => e.email.toLowerCase() === email);
  }, [session, employees]);

  const empName = (id: string) => {
    const e = employees.find((x) => x.id === id);
    return e ? `${e.firstName} ${e.lastName}` : id.slice(0, 8);
  };

  const houseName = (r: Attendance): string => {
    const byId = (id?: string) => (id ? houses.find((h) => h.id === id)?.name : undefined);
    return (
      byId(r.houseId) ??
      byId(schedules.find((s) => s.id === r.scheduleId)?.houseId) ??
      (() => {
        const empHouses = [...new Set(schedules.filter((s) => s.employeeId === r.employeeId).map((s) => s.houseId))];
        return empHouses.length === 1 ? byId(empHouses[0]) : undefined;
      })() ??
      '—'
    );
  };

  const rows = useMemo(() => {
    const scoped = isEmployee && me ? attendance.filter((a) => a.employeeId === me.id) : attendance;
    const filtered =
      statusFilter === 'all' ? scoped : scoped.filter((a) => a.status === statusFilter);
    return [...filtered].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [attendance, isEmployee, me, statusFilter]);

  const openCount = attendance.filter((r) => r.status === 'clocked-in').length;

  function exportCSV() {
    const header = ['Date', 'Employee', 'House', 'Clock In', 'Clock Out', 'Status', 'Source'];
    const data = rows.map((r) => [
      `"${r.date}"`,
      `"${empName(r.employeeId)}"`,
      `"${houseName(r)}"`,
      `"${formatClock(r.clockInAt)}"`,
      `"${formatClock(r.clockOutAt)}"`,
      `"${r.status}"`,
      `"${r.source}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [header.join(','), ...data.map((d) => d.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `hcr_attendance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto flex flex-col gap-6">
      <PageHeader
        title="Time & Attendance"
        subtitle="Real-time EVV clock in / clock out records. Timestamps are captured from device clock and cannot be modified."
        action={
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-teal-600" />
            <span>Export Attendance CSV</span>
          </button>
        }
      />

      {isEmployee ? <AttendanceClock /> : null}

      <Card variant="elevated">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>{isEmployee ? 'My Attendance History' : 'Attendance Records'}</CardTitle>
              <CardDescription>{rows.length} record{rows.length === 1 ? '' : 's'}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg border border-[var(--color-border)] p-0.5 bg-[var(--color-bg-base)] text-xs">
                {(['all', 'clocked-in', 'clocked-out'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                      statusFilter === s
                        ? 'bg-[var(--color-primary)] text-white font-medium'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    {s === 'clocked-in' ? 'On Clock' : s === 'clocked-out' ? 'Completed' : 'All'}
                  </button>
                ))}
              </div>
              <Badge variant={openCount > 0 ? 'success' : 'muted'}>{openCount} on the clock</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
                  <th className="py-2.5 pr-4 font-medium">Date</th>
                  {!isEmployee ? <th className="py-2.5 pr-4 font-medium">Employee</th> : null}
                  <th className="py-2.5 pr-4 font-medium">House</th>
                  <th className="py-2.5 pr-4 font-medium">Clock in</th>
                  <th className="py-2.5 pr-4 font-medium">Clock out</th>
                  <th className="py-2.5 pr-4 font-medium">Duration</th>
                  <th className="py-2.5 pr-4 font-medium">Status</th>
                  <th className="py-2.5 pr-4 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--color-border-subtle)] hover:bg-slate-50/50">
                    <td className="py-2.5 pr-4 tabular-nums font-mono text-xs">{r.date}</td>
                    {!isEmployee ? <td className="py-2.5 pr-4 font-medium">{empName(r.employeeId)}</td> : null}
                    <td className={`py-2.5 pr-4${houseName(r) === '—' ? ' text-[var(--color-text-muted)]' : ''}`}>{houseName(r)}</td>
                    <td className="py-2.5 pr-4 tabular-nums font-mono text-xs">{formatClock(r.clockInAt)}</td>
                    <td className="py-2.5 pr-4 tabular-nums font-mono text-xs">{formatClock(r.clockOutAt)}</td>
                    <td className="py-2.5 pr-4 tabular-nums font-medium">
                      {r.status === 'clocked-in'
                        ? formatDuration(r.clockInAt, Date.now())
                        : formatDuration(r.clockInAt, r.clockOutAt)}
                    </td>
                    <td className="py-2.5 pr-4">
                      <Badge variant={r.status === 'clocked-in' ? 'success' : 'muted'} size="sm">
                        {r.status === 'clocked-in' ? 'on the clock' : 'completed'}
                      </Badge>
                    </td>
                    <td className="py-2.5 pr-4 text-xs font-mono text-[var(--color-text-muted)]">{r.source}</td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={isEmployee ? 7 : 8} className="py-8 text-center text-[var(--color-text-muted)]">
                      No attendance records found matching this filter.{' '}
                      {isEmployee ? (
                        <Link href="/login" className="text-[var(--color-primary)] hover:underline">Go to Time Clock</Link>
                      ) : null}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/app-store';
import { AttendanceClock } from '@/components/attendance-clock';
import { formatClock, formatDuration } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/form';

export default function AttendancePage() {
  const { session, employees, attendance } = useApp();

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

  const rows = useMemo(() => {
    const scoped = isEmployee && me ? attendance.filter((a) => a.employeeId === me.id) : attendance;
    return [...scoped].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [attendance, isEmployee, me]);

  const openCount = rows.filter((r) => r.status === 'clocked-in').length;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto flex flex-col gap-6">
      <PageHeader
        title="Time & Attendance"
        subtitle="Real-time clock in / clock out records. Times are captured from the device clock and can’t be edited."
      />

      {isEmployee ? <AttendanceClock /> : null}

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isEmployee ? 'My attendance history' : 'Attendance records'}</CardTitle>
              <CardDescription>{rows.length} record{rows.length === 1 ? '' : 's'}</CardDescription>
            </div>
            <Badge variant={openCount > 0 ? 'success' : 'muted'}>{openCount} on the clock</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--color-text-secondary)] border-b border-[var(--color-border)]">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  {!isEmployee ? <th className="py-2 pr-4 font-medium">Employee</th> : null}
                  <th className="py-2 pr-4 font-medium">Clock in</th>
                  <th className="py-2 pr-4 font-medium">Clock out</th>
                  <th className="py-2 pr-4 font-medium">Duration</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--color-border-subtle)]">
                    <td className="py-2 pr-4 tabular-nums">{r.date}</td>
                    {!isEmployee ? <td className="py-2 pr-4">{empName(r.employeeId)}</td> : null}
                    <td className="py-2 pr-4 tabular-nums">{formatClock(r.clockInAt)}</td>
                    <td className="py-2 pr-4 tabular-nums">{formatClock(r.clockOutAt)}</td>
                    <td className="py-2 pr-4 tabular-nums">
                      {r.status === 'clocked-in'
                        ? formatDuration(r.clockInAt, Date.now())
                        : formatDuration(r.clockInAt, r.clockOutAt)}
                    </td>
                    <td className="py-2 pr-4">
                      <Badge variant={r.status === 'clocked-in' ? 'success' : 'muted'} size="sm">
                        {r.status === 'clocked-in' ? 'on the clock' : 'completed'}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4 text-[var(--color-text-muted)]">{r.source}</td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={isEmployee ? 5 : 6} className="py-6 text-center text-[var(--color-text-muted)]">
                      No attendance records yet. Clock in from the{' '}
                      {isEmployee ? (
                        <Link href="/login" className="text-[var(--color-primary)] hover:underline">sign-in page</Link>
                      ) : (
                        'employee sign-in page'
                      )}
                      .
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

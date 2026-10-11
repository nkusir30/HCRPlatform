'use client';

import { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/lib/app-store';
import { localDateISO, formatClock, formatDuration, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Time & Attendance clock for a logged-in employee. Renders the employee's
// shift for *today* (matched by day-of-week) and lets them clock in/out.
//
// Real-time, no backdating: both timestamps are captured from `new Date()` at
// the instant the button is pressed inside the store (clockIn/clockOut). The UI
// only ever displays them — there is no input to type or edit a clock time.
export function AttendanceClock({ className }: { className?: string }) {
  const { session, employees, schedules, houses, attendance, clockIn, clockOut } = useApp();

  // Link the session to an employee roster record by email.
  const employee = useMemo(() => {
    if (!session) return undefined;
    const email = session.email.toLowerCase();
    return employees.find((e) => e.email.toLowerCase() === email);
  }, [session, employees]);

  const today = localDateISO();
  const todayDow = new Date().getDay();

  // Today's shift for this employee (day-of-week match).
  const todayShift = useMemo(() => {
    if (!employee) return undefined;
    return schedules.find((s) => s.employeeId === employee.id && s.dayOfWeek === todayDow);
  }, [employee, schedules, todayDow]);

  // Today's attendance record (clocked-in or completed).
  const todayRecord = useMemo(() => {
    if (!employee) return undefined;
    return attendance.find((a) => a.employeeId === employee.id && a.date === today);
  }, [employee, attendance, today]);

  // Live ticker so the elapsed time updates every second while on the clock.
  const [now, setNow] = useState(() => Date.now());
  const clockedIn = todayRecord?.status === 'clocked-in';
  useEffect(() => {
    if (!clockedIn) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [clockedIn]);

  const house = todayShift ? houses.find((h) => h.id === todayShift.houseId) : undefined;
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  function onClockIn() {
    if (!employee) return;
    setMsg(null);
    const res = clockIn({ employeeId: employee.id, scheduleId: todayShift?.id, date: today, source: 'web' });
    if (res.ok) setMsg({ kind: 'success', text: `Clocked in at ${formatClock(new Date().toISOString())}.` });
    else setMsg({ kind: 'error', text: res.error ?? 'Could not clock in.' });
  }

  function onClockOut() {
    if (!todayRecord) return;
    setMsg(null);
    const res = clockOut(todayRecord.id);
    if (res.ok) setMsg({ kind: 'success', text: `Clocked out at ${formatClock(new Date().toISOString())}.` });
    else setMsg({ kind: 'error', text: res.error ?? 'Could not clock out.' });
  }

  if (!employee) {
    return (
      <div className={cn('rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5', className)}>
        <h3 className="text-base font-semibold">Time &amp; Attendance</h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Your account isn’t linked to an employee roster record yet, so there’s no shift to clock into.
          An administrator can connect your login to your employee profile.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 shadow-sm', className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Time &amp; Attendance</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {employee.firstName} {employee.lastName} · {employee.employeeCode}
          </p>
        </div>
        {clockedIn ? (
          <Badge variant="success">On the clock</Badge>
        ) : todayRecord ? (
          <Badge variant="muted">Completed</Badge>
        ) : (
          <Badge variant="warning">Not clocked in</Badge>
        )}
      </div>

      {/* Today's shift */}
      <div className="mt-4 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-border-subtle)]/40 p-3">
        <div className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">Today’s shift</div>
        {todayShift ? (
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="font-medium">{todayShift.startTime} – {todayShift.endTime}</span>
            {house ? <span className="text-[var(--color-text-secondary)]">{house.name}</span> : null}
            <span className="text-[var(--color-text-muted)]">{todayShift.scheduleType}</span>
          </div>
        ) : (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            No shift is scheduled for you today. Clock in/out below is still available for record-keeping.
          </p>
        )}
      </div>

      {/* Live clock + actions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
            {clockedIn ? 'Clocked in at' : todayRecord ? 'Session total' : 'Status'}
          </div>
          <div className="text-2xl font-semibold tabular-nums">
            {clockedIn
              ? formatClock(todayRecord?.clockInAt)
              : todayRecord
                ? formatDuration(todayRecord.clockInAt, todayRecord.clockOutAt)
                : 'Not started'}
          </div>
          {clockedIn && todayRecord ? (
            <div className="text-sm text-[var(--color-success)]">
              Elapsed {formatDuration(todayRecord.clockInAt, now)}
            </div>
          ) : null}
        </div>

        <div className="flex gap-2">
          {clockedIn ? (
            <Button variant="destructive" onClick={onClockOut}>Clock out</Button>
          ) : todayRecord ? (
            <span className="self-center text-sm text-[var(--color-text-muted)]">
              Clocked out at {formatClock(todayRecord.clockOutAt)}
            </span>
          ) : (
            <Button variant="success" onClick={onClockIn}>Clock in</Button>
          )}
        </div>
      </div>

      {/* Recorded punch times (read-only) */}
      {todayRecord ? (
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-3 text-sm">
          <div>
            <dt className="text-xs text-[var(--color-text-muted)]">Clock in</dt>
            <dd className="font-medium tabular-nums">{formatClock(todayRecord.clockInAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--color-text-muted)]">Clock out</dt>
            <dd className="font-medium tabular-nums">{formatClock(todayRecord.clockOutAt)}</dd>
          </div>
        </dl>
      ) : null}

      <p className="mt-3 text-xs text-[var(--color-text-muted)]">
        Times are recorded automatically from the device clock and can’t be edited — no backdating.
      </p>

      {msg ? (
        <div
          className={cn(
            'mt-3 rounded-md px-3 py-2 text-sm',
            msg.kind === 'success'
              ? 'bg-[var(--color-success-light)] text-[var(--color-success)]'
              : 'bg-[var(--color-danger-light)] text-[var(--color-danger)]',
          )}
          role="status"
        >
          {msg.text}
        </div>
      ) : null}
    </div>
  );
}


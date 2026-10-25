'use client';

import { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/lib/app-store';
import { localDateISO, formatClock, formatDuration, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Play,
  Square,
  Home,
  Calendar,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Timer,
} from 'lucide-react';

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

  // Live ticker so the elapsed time and clock update live
  const [now, setNow] = useState(() => Date.now());
  const clockedIn = todayRecord?.status === 'clocked-in';

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const house = todayShift ? houses.find((h) => h.id === todayShift.houseId) : undefined;
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  function onClockIn() {
    if (!employee) return;
    setMsg(null);
    const res = clockIn({
      employeeId: employee.id,
      scheduleId: todayShift?.id,
      houseId: house?.id,
      date: today,
      source: 'web',
    });
    if (res.ok) {
      setMsg({
        kind: 'success',
        text: `Successfully clocked in at ${formatClock(new Date().toISOString())}${
          house ? ` for ${house.name}` : ''
        }.`,
      });
    } else {
      setMsg({ kind: 'error', text: res.error ?? 'Could not clock in.' });
    }
  }

  function onClockOut() {
    if (!todayRecord) return;
    setMsg(null);
    const res = clockOut(todayRecord.id);
    if (res.ok) {
      setMsg({
        kind: 'success',
        text: `Successfully clocked out at ${formatClock(new Date().toISOString())}. Good job!`,
      });
    } else {
      setMsg({ kind: 'error', text: res.error ?? 'Could not clock out.' });
    }
  }

  if (!employee) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-center text-slate-300 backdrop-blur-md',
          className,
        )}
      >
        <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">Roster Profile Connection Required</h3>
        <p className="mt-1.5 text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Your login (<code className="text-teal-300">{session?.email}</code>) has not been linked to a roster employee profile. Please contact your HCR house manager.
        </p>
      </div>
    );
  }

  const liveDateString = new Date(now).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const liveTimeString = new Date(now).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-xl',
        className,
      )}
    >
      {/* Top Header Card */}
      <div className="p-5 border-b border-white/10 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold">
            {employee.firstName[0]}
            {employee.lastName[0]}
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>
                {employee.firstName} {employee.lastName}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                {employee.employeeCode}
              </span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Section 21 Direct Support Professional</span>
            </div>
          </div>
        </div>

        <div>
          {clockedIn ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              On The Clock
            </span>
          ) : todayRecord ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-white/10">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              Shift Completed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Clock className="w-3.5 h-3.5" />
              Not Clocked In
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Today's Shift Overview */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
            <Calendar className="w-3.5 h-3.5 text-teal-400" />
            <span>Scheduled Shift · {liveDateString}</span>
          </div>
          {todayShift ? (
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>
                  {todayShift.startTime} – {todayShift.endTime}
                </span>
                <span className="text-xs font-normal text-slate-400 capitalize">({todayShift.scheduleType})</span>
              </div>
              {house && (
                <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                  <Home className="w-3.5 h-3.5 text-teal-400" />
                  <span>{house.name}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              No predetermined shift is scheduled on your calendar for today. You can still record attendance for on-call or unscheduled coverage.
            </p>
          )}
        </div>

        {/* Live Terminal Clock Display */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-white/10 text-center space-y-2 shadow-inner">
          <div className="text-[11px] uppercase tracking-widest text-teal-400 font-semibold flex items-center justify-center gap-1.5">
            <Timer className="w-3.5 h-3.5" />
            <span>Live System Time (EVV Captured)</span>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-wider font-mono">
            {liveTimeString}
          </div>
          {clockedIn && todayRecord && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
              <span>Active Duration:</span>
              <span className="font-mono font-bold">{formatDuration(todayRecord.clockInAt, now)}</span>
            </div>
          )}
        </div>

        {/* Big Action Buttons */}
        <div>
          {clockedIn ? (
            <button
              type="button"
              onClick={onClockOut}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 active:scale-[0.99] shadow-lg shadow-red-950/60 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Clock Out of Shift</span>
            </button>
          ) : todayRecord ? (
            <div className="p-3.5 rounded-xl bg-teal-950/40 border border-teal-500/30 text-center text-xs text-teal-300 font-medium">
              Shift completed. Today&apos;s verified punch has been safely recorded to payroll.
            </div>
          ) : (
            <button
              type="button"
              onClick={onClockIn}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 hover:from-teal-500 hover:to-emerald-500 active:scale-[0.99] shadow-lg shadow-teal-950/60 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Clock In for Today</span>
            </button>
          )}
        </div>

        {/* Punch Time Log Summary */}
        {todayRecord && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-slate-400 font-medium">Clock In Time</div>
              <div className="text-sm font-bold text-white font-mono mt-1">
                {formatClock(todayRecord.clockInAt)}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-slate-400 font-medium">Clock Out Time</div>
              <div className="text-sm font-bold text-white font-mono mt-1">
                {todayRecord.clockOutAt ? formatClock(todayRecord.clockOutAt) : 'Pending…'}
              </div>
            </div>
          </div>
        )}

        {/* Feedback message */}
        {msg && (
          <div
            className={cn(
              'p-3.5 rounded-xl text-xs sm:text-sm flex items-start gap-2',
              msg.kind === 'success'
                ? 'bg-emerald-950/60 border border-emerald-700/60 text-emerald-200'
                : 'bg-red-950/60 border border-red-700/60 text-red-200',
            )}
          >
            {msg.kind === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        <div className="text-center text-[11px] text-slate-500">
          Timestamps are captured from device EVV clock and cannot be manually modified or backdated.
        </div>
      </div>
    </div>
  );
}

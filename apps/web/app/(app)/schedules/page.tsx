'use client';

import { useState } from 'react';
import { useApp } from '@/lib/app-store';
import type { ScheduleType } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader, Field, TextInput, Select, Alert } from '@/components/form';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SchedulesPage() {
  const { schedules, employees, houses, addSchedule } = useApp();
  const [form, setForm] = useState({
    employeeId: employees[0]?.id ?? '',
    houseId: houses[0]?.id ?? '',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '16:00',
    breakDuration: 30,
    scheduleType: 'shift' as ScheduleType,
    comment: '',
  });
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const empName = (id: string) => {
    const e = employees.find((x) => x.id === id);
    return e ? `${e.firstName} ${e.lastName}` : id.slice(0, 8);
  };
  const houseName = (id: string) => houses.find((h) => h.id === id)?.name ?? id.slice(0, 8);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!form.employeeId || !form.houseId) {
      setMsg({ kind: 'error', text: 'Select an employee and a house.' });
      return;
    }
    if (form.startTime >= form.endTime) {
      setMsg({ kind: 'error', text: 'End time must be after start time.' });
      return;
    }
    addSchedule({ ...form });
    setMsg({ kind: 'success', text: `Shift scheduled for ${empName(form.employeeId)} on ${DAYS[form.dayOfWeek]}.` });
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <PageHeader title="Schedules" subtitle="Recurring weekly shifts assigned to employees at each house." />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled shifts ({schedules.length})</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                    <th className="py-2 pr-3">Day</th>
                    <th className="py-2 pr-3">Time</th>
                    <th className="py-2 pr-3">Employee</th>
                    <th className="py-2 pr-3">House</th>
                    <th className="py-2 pr-3">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s) => (
                    <tr key={s.id} className="border-b border-[var(--color-border-subtle)]">
                      <td className="py-2 pr-3">{DAYS[s.dayOfWeek]}</td>
                      <td className="py-2 pr-3 font-mono text-xs">{s.startTime}–{s.endTime}</td>
                      <td className="py-2 pr-3">{empName(s.employeeId)}</td>
                      <td className="py-2 pr-3">{houseName(s.houseId)}</td>
                      <td className="py-2 pr-3"><Badge size="sm">{s.scheduleType}</Badge></td>
                    </tr>
                  ))}
                  {schedules.length === 0 ? (
                    <tr><td colSpan={5} className="py-6 text-center text-[var(--color-text-muted)]">No shifts scheduled.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>New shift</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="flex flex-col gap-3">
                {msg ? <Alert kind={msg.kind}>{msg.text}</Alert> : null}
                <Field label="Employee">
                  <Select value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))}>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeCode})</option>
                    ))}
                  </Select>
                </Field>
                <Field label="House">
                  <Select value={form.houseId} onChange={(e) => setForm((f) => ({ ...f, houseId: e.target.value }))}>
                    {houses.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Day">
                    <Select value={form.dayOfWeek} onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: Number(e.target.value) }))}>
                      {DAYS.map((d, i) => (<option key={d} value={i}>{d}</option>))}
                    </Select>
                  </Field>
                  <Field label="Type">
                    <Select value={form.scheduleType} onChange={(e) => setForm((f) => ({ ...f, scheduleType: e.target.value as ScheduleType }))}>
                      <option value="shift">shift</option>
                      <option value="floor">floor</option>
                      <option value="flex">flex</option>
                      <option value="on-call">on-call</option>
                    </Select>
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Start"><TextInput type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} /></Field>
                  <Field label="End"><TextInput type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} /></Field>
                  <Field label="Break (m)"><TextInput type="number" min={0} value={form.breakDuration} onChange={(e) => setForm((f) => ({ ...f, breakDuration: Number(e.target.value) }))} /></Field>
                </div>
                <Field label="Comment"><TextInput value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} placeholder="Optional" /></Field>
                <button type="submit" className="mt-1 rounded-md bg-[var(--color-primary)] text-white px-4 py-2.5 font-medium hover:bg-[var(--color-primary-hover)]">
                  Schedule shift
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

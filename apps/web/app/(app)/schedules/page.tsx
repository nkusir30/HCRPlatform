'use client';

import { useState } from 'react';
import { useApp } from '@/lib/app-store';
import { PAYROLL_PERIOD_ID } from '@/lib/seed';
import type { Schedule, ScheduleType } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader, Field, TextInput, Select, Alert } from '@/components/form';
import { Download, Calendar, Filter } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS = [1, 2, 3, 4, 5];

const emptyForm = {
  employeeId: '',
  houseId: '',
  days: [1] as number[],
  startTime: '08:00',
  endTime: '16:00',
  breakDuration: 30,
  scheduleType: 'shift' as ScheduleType,
  comment: '',
};

type FormState = typeof emptyForm;

export default function SchedulesPage() {
  const { schedules, employees, houses, addSchedules, updateSchedule, deleteSchedule } = useApp();
  const [form, setForm] = useState<FormState>({
    ...emptyForm,
    employeeId: employees[0]?.id ?? '',
    houseId: houses[0]?.id ?? '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [houseFilter, setHouseFilter] = useState<string>('all');
  const [dayFilter, setDayFilter] = useState<string>('all');
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const empName = (id: string) => {
    const e = employees.find((x) => x.id === id);
    return e ? `${e.firstName} ${e.lastName}` : id.slice(0, 8);
  };
  const houseName = (id: string) => houses.find((h) => h.id === id)?.name ?? id.slice(0, 8);

  const filteredSchedules = schedules.filter((s) => {
    const matchesHouse = houseFilter === 'all' || s.houseId === houseFilter;
    const matchesDay = dayFilter === 'all' || s.dayOfWeek.toString() === dayFilter;
    return matchesHouse && matchesDay;
  });

  function toggleDay(day: number) {
    setForm((f) => {
      const has = f.days.includes(day);
      const next = has ? f.days.filter((d) => d !== day) : [...f.days, day].sort((a, b) => a - b);
      return { ...f, days: editingId ? next.slice(0, 1) : next };
    });
  }

  function startEdit(s: Schedule) {
    setEditingId(s.id);
    setConfirmId(null);
    setMsg(null);
    setForm({
      employeeId: s.employeeId,
      houseId: s.houseId,
      days: [s.dayOfWeek],
      startTime: s.startTime,
      endTime: s.endTime,
      breakDuration: s.breakDuration ?? 30,
      scheduleType: s.scheduleType,
      comment: s.comment ?? '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setMsg(null);
    setForm({ ...emptyForm, employeeId: employees[0]?.id ?? '', houseId: houses[0]?.id ?? '' });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!form.employeeId || !form.houseId) {
      setMsg({ kind: 'error', text: 'Select an employee and a house.' });
      return;
    }
    if (form.days.length === 0) {
      setMsg({ kind: 'error', text: 'Select at least one day.' });
      return;
    }
    if (form.startTime >= form.endTime) {
      setMsg({ kind: 'error', text: 'End time must be after start time.' });
      return;
    }
    const base = {
      employeeId: form.employeeId,
      houseId: form.houseId,
      payrollPeriodId: PAYROLL_PERIOD_ID,
      startTime: form.startTime,
      endTime: form.endTime,
      breakDuration: form.breakDuration,
      scheduleType: form.scheduleType,
      comment: form.comment.trim() || undefined,
    };

    if (editingId) {
      updateSchedule(editingId, { ...base, dayOfWeek: form.days[0] ?? 1 });
      setMsg({ kind: 'success', text: `Shift updated for ${empName(form.employeeId)}.` });
      cancelEdit();
      return;
    }

    addSchedules(form.days.map((dayOfWeek) => ({ ...base, dayOfWeek })));
    const labels = form.days.map((d) => DAYS[d]).join(', ');
    setMsg({
      kind: 'success',
      text: `${form.days.length} shift${form.days.length > 1 ? 's' : ''} scheduled for ${empName(form.employeeId)} on ${labels}.`,
    });
    setForm((f) => ({ ...f, comment: '' }));
  }

  function confirmDelete() {
    if (!confirmId) return;
    deleteSchedule(confirmId);
    setConfirmId(null);
    if (editingId === confirmId) cancelEdit();
    setMsg({ kind: 'success', text: 'Shift removed.' });
  }

  function exportCSV() {
    const header = ['Day', 'Start Time', 'End Time', 'Employee', 'House', 'Type', 'Break Duration', 'Comment'];
    const rows = filteredSchedules.map((s) => [
      `"${DAYS[s.dayOfWeek]}"`,
      `"${s.startTime}"`,
      `"${s.endTime}"`,
      `"${empName(s.employeeId)}"`,
      `"${houseName(s.houseId)}"`,
      `"${s.scheduleType}"`,
      s.breakDuration ?? 30,
      `"${(s.comment || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `hcr_schedules_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Schedules"
        subtitle="Recurring weekly shifts assigned to care staff across each residential group home."
        action={
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-teal-600" />
            <span>Export Schedule CSV</span>
          </button>
        }
      />

      {msg ? <div className="mb-4"><Alert kind={msg.kind}>{msg.text}</Alert></div> : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>Scheduled Shifts ({filteredSchedules.length})</CardTitle>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <select
                    value={houseFilter}
                    onChange={(e) => setHouseFilter(e.target.value)}
                    className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-base)] px-2.5 py-1 text-xs"
                  >
                    <option value="all">All houses</option>
                    {houses.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>

                  <select
                    value={dayFilter}
                    onChange={(e) => setDayFilter(e.target.value)}
                    className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-base)] px-2.5 py-1 text-xs"
                  >
                    <option value="all">All days</option>
                    {DAYS.map((d, i) => (
                      <option key={d} value={i.toString()}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                    <th className="py-2.5 pr-3">Day</th>
                    <th className="py-2.5 pr-3">Time</th>
                    <th className="py-2.5 pr-3">Employee</th>
                    <th className="py-2.5 pr-3">House</th>
                    <th className="py-2.5 pr-3">Type</th>
                    <th className="py-2.5 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.map((s) => (
                    <tr key={s.id} className={`border-b border-[var(--color-border-subtle)] ${editingId === s.id ? 'bg-[var(--color-primary-light)]' : 'hover:bg-slate-50/50'}`}>
                      <td className="py-2.5 pr-3 font-semibold text-teal-700">{DAYS[s.dayOfWeek]}</td>
                      <td className="py-2.5 pr-3 font-mono text-xs">{s.startTime}–{s.endTime}</td>
                      <td className="py-2.5 pr-3 font-medium text-[var(--color-text-primary)]">{empName(s.employeeId)}</td>
                      <td className="py-2.5 pr-3 text-[var(--color-text-secondary)]">{houseName(s.houseId)}</td>
                      <td className="py-2.5 pr-3"><Badge size="sm">{s.scheduleType}</Badge></td>
                      <td className="py-2.5 pr-3">
                        {confirmId === s.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-[var(--color-text-secondary)]">Delete?</span>
                            <button onClick={confirmDelete} className="text-xs rounded px-2.5 py-1 bg-[var(--color-danger)] text-white hover:opacity-90 font-medium">Yes</button>
                            <button onClick={() => setConfirmId(null)} className="text-xs rounded px-2 py-1 border border-[var(--color-border)] hover:bg-[var(--color-border-subtle)]">No</button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => startEdit(s)} className="text-xs text-[var(--color-primary)] hover:underline font-medium">Edit</button>
                            <button onClick={() => { setConfirmId(s.id); setMsg(null); }} className="text-xs text-[var(--color-danger)] hover:underline">Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredSchedules.length === 0 ? (
                    <tr><td colSpan={6} className="py-8 text-center text-[var(--color-text-muted)]">No shifts scheduled matching this filter.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit shift' : 'Schedule new shift'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="flex flex-col gap-3">
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

                <Field label={editingId ? 'Day' : 'Days'} hint={editingId ? undefined : 'Select one or more days — a recurring shift is created for each.'}>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {DAYS.map((d, i) => {
                      const active = form.days.includes(i);
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleDay(i)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                            active
                              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-xs'
                              : 'border-[var(--color-border)] hover:bg-[var(--color-border-subtle)] text-[var(--color-text-secondary)]'
                          }`}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                  {!editingId ? (
                    <div className="flex flex-wrap gap-3 mt-2 text-xs">
                      <button type="button" onClick={() => setForm((f) => ({ ...f, days: WEEKDAYS }))} className="text-[var(--color-primary)] hover:underline font-medium">Weekdays (Mon-Fri)</button>
                      <button type="button" onClick={() => setForm((f) => ({ ...f, days: [0, 1, 2, 3, 4, 5, 6] }))} className="text-[var(--color-primary)] hover:underline font-medium">All 7 Days</button>
                      <button type="button" onClick={() => setForm((f) => ({ ...f, days: [] }))} className="text-[var(--color-text-muted)] hover:underline">Clear</button>
                    </div>
                  ) : null}
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Shift Type">
                    <Select value={form.scheduleType} onChange={(e) => setForm((f) => ({ ...f, scheduleType: e.target.value as ScheduleType }))}>
                      <option value="shift">Regular Shift</option>
                      <option value="floor">Floor Coverage</option>
                      <option value="flex">Flex Shift</option>
                      <option value="on-call">On-Call</option>
                    </Select>
                  </Field>
                  <Field label="Break (mins)"><TextInput type="number" min={0} value={form.breakDuration} onChange={(e) => setForm((f) => ({ ...f, breakDuration: Number(e.target.value) }))} /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start Time"><TextInput type="time" value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} /></Field>
                  <Field label="End Time"><TextInput type="time" value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))} /></Field>
                </div>
                <Field label="Comment / Notes"><TextInput value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))} placeholder="Optional instructions" /></Field>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 rounded-lg bg-[var(--color-primary)] text-white px-4 py-2.5 font-medium hover:bg-[var(--color-primary-hover)] shadow-xs transition-colors cursor-pointer">
                    {editingId ? 'Save changes' : form.days.length > 1 ? `Schedule ${form.days.length} shifts` : 'Schedule shift'}
                  </button>
                  {editingId ? (
                    <button type="button" onClick={cancelEdit} className="rounded-lg border border-[var(--color-border)] px-4 py-2.5 hover:bg-[var(--color-border-subtle)] transition-colors cursor-pointer">
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

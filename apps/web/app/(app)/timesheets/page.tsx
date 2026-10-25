'use client';

import { useState } from 'react';
import { useApp } from '@/lib/app-store';
import { PAYROLL_PERIOD_ID } from '@/lib/seed';
import type { WorkType, LaborCategory, Timesheet } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { PageHeader, Field, TextInput, Select, Alert } from '@/components/form';
import { Download, CheckCheck, Filter } from 'lucide-react';

const WORK_TYPES: WorkType[] = ['direct-care', 'clinical', 'admission', 'transfer', 'other'];
const LABOR: LaborCategory[] = ['CNAs', 'LPNs', 'RNs', 'therapists', 'support', 'administrative'];

const statusVariant: Record<string, BadgeProps['variant']> = {
  approved: 'success',
  submitted: 'warning',
  draft: 'default',
};

const emptyForm = {
  employeeId: '',
  date: new Date().toISOString().slice(0, 10),
  workType: 'direct-care' as WorkType,
  laborCategory: 'CNAs' as LaborCategory,
  hours: 8,
  notes: '',
};

type FormState = typeof emptyForm;

export default function TimesheetsPage() {
  const { timesheets, employees, companyId, addTimesheet, updateTimesheet, deleteTimesheet, setTimesheetStatus } = useApp();
  const [form, setForm] = useState<FormState>({ ...emptyForm, employeeId: employees[0]?.id ?? '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const empName = (id: string) => {
    const e = employees.find((x) => x.id === id);
    return e ? `${e.firstName} ${e.lastName}` : id.slice(0, 8);
  };

  const filteredTimesheets =
    statusFilter === 'all'
      ? timesheets
      : timesheets.filter((t) => t.status === statusFilter);

  const pendingCount = timesheets.filter((t) => t.status === 'submitted').length;
  const totalHours = timesheets.reduce((sum, t) => sum + t.hours, 0);

  function startEdit(t: Timesheet) {
    setEditingId(t.id);
    setConfirmId(null);
    setMsg(null);
    setForm({
      employeeId: t.employeeId,
      date: t.date,
      workType: t.workType,
      laborCategory: t.laborCategory,
      hours: t.hours,
      notes: t.notes ?? '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setMsg(null);
    setForm({ ...emptyForm, employeeId: employees[0]?.id ?? '' });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!form.employeeId) {
      setMsg({ kind: 'error', text: 'Select an employee.' });
      return;
    }
    if (form.hours <= 0 || form.hours > 24) {
      setMsg({ kind: 'error', text: 'Hours must be between 0 and 24.' });
      return;
    }
    const base = {
      companyId,
      payrollPeriodId: PAYROLL_PERIOD_ID,
      employeeId: form.employeeId,
      date: form.date,
      workType: form.workType,
      laborCategory: form.laborCategory,
      hours: form.hours,
      notes: form.notes.trim() || undefined,
    };

    if (editingId) {
      updateTimesheet(editingId, { ...base, status: 'submitted' });
      setMsg({ kind: 'success', text: `Entry updated for ${empName(form.employeeId)}.` });
      cancelEdit();
      return;
    }

    addTimesheet({ ...base, status: 'submitted' });
    setMsg({ kind: 'success', text: `Logged ${form.hours}h for ${empName(form.employeeId)}.` });
    setForm((f) => ({ ...f, hours: 8, notes: '' }));
  }

  function confirmDelete() {
    if (!confirmId) return;
    deleteTimesheet(confirmId);
    setConfirmId(null);
    if (editingId === confirmId) cancelEdit();
    setMsg({ kind: 'success', text: 'Entry removed.' });
  }

  function approveAllPending() {
    const pending = timesheets.filter((t) => t.status === 'submitted');
    pending.forEach((t) => setTimesheetStatus(t.id, 'approved'));
    setMsg({ kind: 'success', text: `Approved ${pending.length} pending timesheets for payroll.` });
  }

  function exportCSV() {
    const header = ['Date', 'Employee', 'Work Type', 'Labor Category', 'Hours', 'Status', 'Notes'];
    const rows = filteredTimesheets.map((t) => [
      `"${t.date}"`,
      `"${empName(t.employeeId)}"`,
      `"${t.workType}"`,
      `"${t.laborCategory}"`,
      t.hours,
      `"${t.status}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `hcr_timesheets_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Timesheets"
        subtitle={`${timesheets.length} entries · ${totalHours} total hours logged across residential homes.`}
        action={
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={approveAllPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Approve All Pending ({pendingCount})</span>
              </button>
            )}
            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] transition-colors shadow-xs"
            >
              <Download className="w-4 h-4 text-teal-600" />
              <span>Export CSV</span>
            </button>
          </div>
        }
      />

      {msg ? <div className="mb-4"><Alert kind={msg.kind}>{msg.text}</Alert></div> : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>Time Entries ({filteredTimesheets.length})</CardTitle>
                <div className="flex items-center gap-1 text-xs">
                  {['all', 'submitted', 'approved', 'draft'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatusFilter(s)}
                      className={`capitalize px-2.5 py-1 rounded-md transition-colors ${
                        statusFilter === s
                          ? 'bg-[var(--color-primary)] text-white font-medium'
                          : 'text-[var(--color-text-muted)] hover:bg-[var(--color-border-subtle)]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                    <th className="py-2.5 pr-3">Date</th>
                    <th className="py-2.5 pr-3">Employee</th>
                    <th className="py-2.5 pr-3">Type</th>
                    <th className="py-2.5 pr-3">Hours</th>
                    <th className="py-2.5 pr-3">Status</th>
                    <th className="py-2.5 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTimesheets.map((t) => (
                    <tr key={t.id} className="border-b border-[var(--color-border-subtle)] hover:bg-slate-50/50">
                      <td className="py-2.5 pr-3 font-mono text-xs">{t.date}</td>
                      <td className="py-2.5 pr-3 font-medium text-[var(--color-text-primary)]">{empName(t.employeeId)}</td>
                      <td className="py-2.5 pr-3 text-[var(--color-text-secondary)]">{t.workType} · {t.laborCategory}</td>
                      <td className="py-2.5 pr-3 font-bold">{t.hours}h</td>
                      <td className="py-2.5 pr-3"><Badge variant={statusVariant[t.status]} size="sm">{t.status}</Badge></td>
                      <td className="py-2.5 pr-3">
                        {confirmId === t.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-[var(--color-text-secondary)]">Delete?</span>
                            <button onClick={confirmDelete} className="text-xs rounded px-2.5 py-1 bg-[var(--color-danger)] text-white hover:opacity-90 font-medium">Yes</button>
                            <button onClick={() => setConfirmId(null)} className="text-xs rounded px-2 py-1 border border-[var(--color-border)] hover:bg-[var(--color-border-subtle)]">No</button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2.5">
                            {t.status !== 'approved' ? (
                              <button
                                onClick={() => setTimesheetStatus(t.id, 'approved')}
                                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                              >
                                Approve
                              </button>
                            ) : null}
                            <button onClick={() => startEdit(t)} className="text-xs text-[var(--color-primary)] hover:underline">Edit</button>
                            <button onClick={() => { setConfirmId(t.id); setMsg(null); }} className="text-xs text-[var(--color-danger)] hover:underline">Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredTimesheets.length === 0 ? (
                    <tr><td colSpan={6} className="py-8 text-center text-[var(--color-text-muted)]">No time entries found for this filter.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit timesheet entry' : 'Log care time'}</CardTitle>
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
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date"><TextInput type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></Field>
                  <Field label="Hours"><TextInput type="number" min={0} max={24} step={0.5} value={form.hours} onChange={(e) => setForm((f) => ({ ...f, hours: Number(e.target.value) }))} /></Field>
                </div>
                <Field label="Work type">
                  <Select value={form.workType} onChange={(e) => setForm((f) => ({ ...f, workType: e.target.value as WorkType }))}>
                    {WORK_TYPES.map((w) => (<option key={w} value={w}>{w}</option>))}
                  </Select>
                </Field>
                <Field label="Labor category">
                  <Select value={form.laborCategory} onChange={(e) => setForm((f) => ({ ...f, laborCategory: e.target.value as LaborCategory }))}>
                    {LABOR.map((l) => (<option key={l} value={l}>{l}</option>))}
                  </Select>
                </Field>
                <Field label="Notes"><TextInput value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional care notes" /></Field>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 rounded-lg bg-[var(--color-primary)] text-white px-4 py-2.5 font-medium hover:bg-[var(--color-primary-hover)] shadow-xs transition-colors cursor-pointer">
                    {editingId ? 'Save changes' : 'Submit entry'}
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

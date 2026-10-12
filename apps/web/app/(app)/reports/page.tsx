'use client';

import { useState } from 'react';
import { useApp } from '@/lib/app-store';
import type { ReportType, Report } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { PageHeader, Field, Select, TextInput, Alert } from '@/components/form';

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'payroll-summary', label: 'Payroll summary' },
  { value: 'paycheck-detail', label: 'Paycheck detail' },
  { value: 'tax-report', label: 'Tax report' },
  { value: 'timesheet', label: 'Timesheet report' },
  { value: 'attendance', label: 'Attendance report' },
  { value: 'audit-log', label: 'Audit log' },
  { value: 'custom', label: 'Custom' },
];

const statusVariant: Record<string, BadgeProps['variant']> = {
  completed: 'success',
  processing: 'info',
  pending: 'warning',
  failed: 'danger',
};

export default function ReportsPage() {
  const { reports, timesheets, employees, houses, addReport, updateReport, deleteReport } = useApp();
  const [reportType, setReportType] = useState<ReportType>('payroll-summary');
  const [parameters, setParameters] = useState('');
  const [employeeId, setEmployeeId] = useState('all');
  const [houseId, setHouseId] = useState('all');
  const [period, setPeriod] = useState<'current' | 'weekly' | 'biweekly' | 'custom'>('current');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const useStructured = reportType === 'timesheet' || reportType === 'attendance';
  const typeLabel = REPORT_TYPES.find((t) => t.value === reportType)?.label ?? reportType;

  const sortedEmployees = [...employees].sort((a, b) =>
    `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
  );
  const employee = employees.find((x) => x.id === employeeId);
  const house = houses.find((x) => x.id === houseId);

  function addDays(iso: string, days: number): string {
    const d = new Date(`${iso}T00:00:00`);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  // The exact text that will be saved as the report's parameters.
  function previewParams(): string {
    if (!useStructured) return parameters.trim() || 'Current period, all employees';
    const who = employee ? `${employee.firstName} ${employee.lastName} (${employee.employeeCode})` : 'All employees';
    const where = house ? `${house.name} (${house.code})` : 'All houses';
    const when =
      period === 'current'
        ? 'Current period'
        : period === 'weekly'
          ? `Weekly, ${startDate} to ${addDays(startDate, 6)}`
          : period === 'biweekly'
            ? `Biweekly, ${startDate} to ${addDays(startDate, 13)}`
            : `Custom, ${startDate} to ${endDate || startDate}`;
    const extra = notes.trim() ? ` — ${notes.trim()}` : '';
    return `${typeLabel}: ${who}; ${where}; ${when}${extra}`;
  }

  const totalHours = timesheets.reduce((s, t) => s + t.hours, 0);
  const approvedHours = timesheets.filter((t) => t.status === 'approved').reduce((s, t) => s + t.hours, 0);

  function resetStructured() {
    setEmployeeId('all');
    setHouseId('all');
    setPeriod('current');
    setStartDate(new Date().toISOString().slice(0, 10));
    setEndDate('');
    setNotes('');
  }

  function startEdit(r: Report) {
    setEditingId(r.id);
    setConfirmId(null);
    setMsg(null);
    setReportType(r.type);
    setParameters(r.parameters);
    resetStructured();
  }

  function cancelEdit() {
    setEditingId(null);
    setMsg(null);
    setReportType('payroll-summary');
    setParameters('');
    resetStructured();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (useStructured && !editingId) {
      if (period === 'custom' && endDate && endDate < startDate) {
        setMsg({ kind: 'error', text: 'End date must be on or after the start date.' });
        return;
      }
      addReport({ type: reportType, parameters: previewParams() });
      setMsg({ kind: 'success', text: 'Report requested. It will appear below as pending.' });
      resetStructured();
      return;
    }
    const params = parameters.trim() || 'Current period, all employees';
    if (editingId) {
      updateReport(editingId, { type: reportType, parameters: params });
      setMsg({ kind: 'success', text: 'Report updated.' });
      cancelEdit();
      return;
    }
    addReport({ type: reportType, parameters: params });
    setMsg({ kind: 'success', text: 'Report requested. It will appear below as pending.' });
    setParameters('');
  }

  function confirmDelete() {
    if (!confirmId) return;
    deleteReport(confirmId);
    setConfirmId(null);
    if (editingId === confirmId) cancelEdit();
    setMsg({ kind: 'success', text: 'Report removed.' });
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <PageHeader title="Reports" subtitle="Summaries generated from live scheduling, timesheet and payroll data." />

      <section className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card variant="elevated"><CardContent className="pt-6">
          <div className="text-sm text-[var(--color-text-secondary)]">Employees</div>
          <div className="text-2xl font-semibold">{employees.length}</div>
        </CardContent></Card>
        <Card variant="elevated"><CardContent className="pt-6">
          <div className="text-sm text-[var(--color-text-secondary)]">Total hours</div>
          <div className="text-2xl font-semibold">{totalHours}</div>
        </CardContent></Card>
        <Card variant="elevated"><CardContent className="pt-6">
          <div className="text-sm text-[var(--color-text-secondary)]">Approved hours</div>
          <div className="text-2xl font-semibold">{approvedHours}</div>
        </CardContent></Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Report history ({reports.length})</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                    <th className="py-2 pr-3">ID</th>
                    <th className="py-2 pr-3">Type</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Requested</th>
                    <th className="py-2 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} className={`border-b border-[var(--color-border-subtle)] ${editingId === r.id ? 'bg-[var(--color-primary-light)]' : ''}`}>
                      <td className="py-2 pr-3 font-mono text-xs">{r.reportId}</td>
                      <td className="py-2 pr-3">{REPORT_TYPES.find((t) => t.value === r.type)?.label ?? r.type}</td>
                      <td className="py-2 pr-3"><Badge variant={statusVariant[r.status]} size="sm">{r.status}</Badge></td>
                      <td className="py-2 pr-3 text-[var(--color-text-secondary)]">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 pr-3">
                        {confirmId === r.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-[var(--color-text-secondary)]">Delete?</span>
                            <button onClick={confirmDelete} className="text-xs rounded px-2 py-1 bg-[var(--color-danger)] text-white hover:opacity-90">Yes</button>
                            <button onClick={() => setConfirmId(null)} className="text-xs rounded px-2 py-1 border border-[var(--color-border)] hover:bg-[var(--color-border-subtle)]">No</button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => startEdit(r)} className="text-xs text-[var(--color-primary)] hover:underline">Edit</button>
                            <button onClick={() => { setConfirmId(r.id); setMsg(null); }} className="text-xs text-[var(--color-danger)] hover:underline">Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 ? (
                    <tr><td colSpan={5} className="py-6 text-center text-[var(--color-text-muted)]">No reports yet.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit report' : 'Request report'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="flex flex-col gap-3">
                {msg ? <Alert kind={msg.kind}>{msg.text}</Alert> : null}
                <Field label="Report type">
                  <Select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)}>
                    {REPORT_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                  </Select>
                </Field>
                {useStructured && !editingId ? (
                  <>
                    <Field label="Employee" hint="One person, or everyone">
                      <Select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
                        <option value="all">All employees</option>
                        {sortedEmployees.map((x) => (
                          <option key={x.id} value={x.id}>{x.firstName} {x.lastName} — {x.employeeCode}</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="House" hint="One house, or every house">
                      <Select value={houseId} onChange={(e) => setHouseId(e.target.value)}>
                        <option value="all">All houses</option>
                        {houses.map((x) => (
                          <option key={x.id} value={x.id}>{x.name} — {x.code}</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Duration">
                      <Select value={period} onChange={(e) => setPeriod(e.target.value as typeof period)}>
                        <option value="current">Current period</option>
                        <option value="weekly">Weekly (7 days from start)</option>
                        <option value="biweekly">Biweekly (14 days from start)</option>
                        <option value="custom">Custom range</option>
                      </Select>
                    </Field>
                    {period !== 'current' ? (
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Start date">
                          <TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </Field>
                        {period === 'custom' ? (
                          <Field label="End date">
                            <TextInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                          </Field>
                        ) : (
                          <Field label="End date (auto)">
                            <TextInput type="date" value={addDays(startDate, period === 'weekly' ? 6 : 13)} disabled />
                          </Field>
                        )}
                      </div>
                    ) : null}
                    <Field label="Notes" hint="Optional">
                      <TextInput value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. include overtime only" />
                    </Field>
                    <p className="text-xs text-[var(--color-text-secondary)] rounded-md bg-[var(--color-border-subtle)] px-3 py-2">
                      Request: {previewParams()}
                    </p>
                  </>
                ) : (
                  <Field label="Parameters" hint="Optional — defaults to current period, all employees">
                    <TextInput value={parameters} onChange={(e) => setParameters(e.target.value)} placeholder="e.g. Period 2026-10-01 to 2026-10-15" />
                  </Field>
                )}
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 rounded-md bg-[var(--color-primary)] text-white px-4 py-2.5 font-medium hover:bg-[var(--color-primary-hover)]">
                    {editingId ? 'Save changes' : 'Request report'}
                  </button>
                  {editingId ? (
                    <button type="button" onClick={cancelEdit} className="rounded-md border border-[var(--color-border)] px-4 py-2.5 hover:bg-[var(--color-border-subtle)]">
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

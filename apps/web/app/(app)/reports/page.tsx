'use client';

import { useState } from 'react';
import { useApp } from '@/lib/app-store';
import type { ReportType } from '@/lib/types';
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
  const { reports, timesheets, employees, addReport } = useApp();
  const [form, setForm] = useState<{ type: ReportType; parameters: string }>({
    type: 'payroll-summary',
    parameters: '',
  });
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const totalHours = timesheets.reduce((s, t) => s + t.hours, 0);
  const approvedHours = timesheets.filter((t) => t.status === 'approved').reduce((s, t) => s + t.hours, 0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    addReport({ type: form.type, parameters: form.parameters.trim() || 'Current period, all employees' });
    setMsg({ kind: 'success', text: 'Report requested. It will appear below as pending.' });
    setForm((f) => ({ ...f, parameters: '' }));
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
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} className="border-b border-[var(--color-border-subtle)]">
                      <td className="py-2 pr-3 font-mono text-xs">{r.reportId}</td>
                      <td className="py-2 pr-3">{REPORT_TYPES.find((t) => t.value === r.type)?.label ?? r.type}</td>
                      <td className="py-2 pr-3"><Badge variant={statusVariant[r.status]} size="sm">{r.status}</Badge></td>
                      <td className="py-2 pr-3 text-[var(--color-text-secondary)]">{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {reports.length === 0 ? (
                    <tr><td colSpan={4} className="py-6 text-center text-[var(--color-text-muted)]">No reports yet.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Request report</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="flex flex-col gap-3">
                {msg ? <Alert kind={msg.kind}>{msg.text}</Alert> : null}
                <Field label="Report type">
                  <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ReportType }))}>
                    {REPORT_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                  </Select>
                </Field>
                <Field label="Parameters" hint="Optional — defaults to current period, all employees">
                  <TextInput value={form.parameters} onChange={(e) => setForm((f) => ({ ...f, parameters: e.target.value }))} placeholder="e.g. Period 2026-10-01 to 2026-10-15" />
                </Field>
                <button type="submit" className="mt-1 rounded-md bg-[var(--color-primary)] text-white px-4 py-2.5 font-medium hover:bg-[var(--color-primary-hover)]">
                  Request report
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

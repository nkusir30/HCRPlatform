'use client';

import { useState } from 'react';
import { useApp } from '@/lib/app-store';
import type { Employee } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader, Field, TextInput, Select, Alert } from '@/components/form';
import { Download, Search, X, UserPlus, Filter } from 'lucide-react';

const empty = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  employeeCode: '',
  employmentStatus: 'full-time',
  hireDate: new Date().toISOString().slice(0, 10),
};

type FormState = typeof empty;

// 10-digit US numbers render as (xxx) xxx-xxxx; anything else (or nothing)
// stays exactly as stored — never invent a placeholder number.
function formatPhone(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return raw || '';
}

export default function EmployeesPage() {
  const { employees, companyId, addEmployee, updateEmployee, deleteEmployee } = useApp();
  const [form, setForm] = useState<FormState>({ ...empty });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const q = search.trim().toLowerCase();
  const qDigits = q.replace(/\D/g, '');

  const filteredByStatus =
    statusFilter === 'all'
      ? employees
      : employees.filter((e) => e.employmentStatus.toLowerCase() === statusFilter.toLowerCase());

  const visible = q
    ? filteredByStatus.filter(
        (e) =>
          `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.employeeCode.toLowerCase().includes(q) ||
          (qDigits !== '' && (e.phone || '').replace(/\D/g, '').includes(qDigits)),
      )
    : filteredByStatus;

  function set(k: keyof FormState, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function startEdit(e: Employee) {
    setEditingId(e.id);
    setConfirmId(null);
    setMsg(null);
    setForm({
      firstName: e.firstName,
      lastName: e.lastName,
      email: e.email,
      phone: e.phone,
      employeeCode: e.employeeCode,
      employmentStatus: e.employmentStatus,
      hireDate: e.hireDate,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setMsg(null);
    setForm({ ...empty });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.employeeCode.trim()) {
      setMsg({ kind: 'error', text: 'First name, last name, email and employee code are required.' });
      return;
    }
    const dup = employees.some(
      (x) => x.email.toLowerCase() === form.email.trim().toLowerCase() && x.id !== editingId,
    );
    if (dup) {
      setMsg({ kind: 'error', text: 'Another employee with that email already exists.' });
      return;
    }
    const current = editingId ? employees.find((x) => x.id === editingId) : undefined;
    const payload = {
      companyId,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      employeeCode: form.employeeCode.trim(),
      employmentStatus: form.employmentStatus,
      hireDate: form.hireDate,
    };

    if (editingId) {
      updateEmployee(editingId, { ...payload, isActive: current?.isActive ?? true });
      setMsg({ kind: 'success', text: `${payload.firstName} ${payload.lastName} updated.` });
      setEditingId(null);
      setForm({ ...empty });
    } else {
      addEmployee({ ...payload, isActive: true });
      setMsg({ kind: 'success', text: `${payload.firstName} ${payload.lastName} added to the roster.` });
      setForm({ ...empty });
    }
  }

  function confirmDelete() {
    if (!confirmId) return;
    const emp = employees.find((x) => x.id === confirmId);
    deleteEmployee(confirmId);
    setConfirmId(null);
    if (editingId === confirmId) cancelEdit();
    setMsg({ kind: 'success', text: `${emp ? emp.firstName + ' ' + emp.lastName : 'Employee'} removed.` });
  }

  function exportCSV() {
    const header = ['Code', 'First Name', 'Last Name', 'Email', 'Phone', 'Status', 'Hire Date'];
    const rows = visible.map((e) => [
      `"${e.employeeCode}"`,
      `"${e.firstName}"`,
      `"${e.lastName}"`,
      `"${e.email}"`,
      `"${e.phone || ''}"`,
      `"${e.employmentStatus}"`,
      `"${e.hireDate || ''}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hcr_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Employees"
        subtitle="Roster of direct care staff. New staff flow automatically into scheduling, EVV and timesheets."
        action={
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-teal-600" />
            <span>Export Roster CSV</span>
          </button>
        }
      />

      {msg ? <div className="mb-4"><Alert kind={msg.kind}>{msg.text}</Alert></div> : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle>Roster ({visible.length}{q || statusFilter !== 'all' ? ` of ${employees.length}` : ''})</CardTitle>
                <div className="flex items-center gap-1 text-xs">
                  {['all', 'full-time', 'part-time', 'contractor'].map((s) => (
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
              <div className="mb-3 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, code, or phone…"
                  aria-label="Search employees"
                  className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Fixed-height scroll area so a 100+ person roster stays navigable */}
              <div className="max-h-[65vh] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-border)] sticky top-0 bg-white shadow-[0_1px_0_0_var(--color-border)]">
                      <th className="py-2.5 pr-3">Code</th>
                      <th className="py-2.5 pr-3">Name</th>
                      <th className="py-2.5 pr-3">Email</th>
                      <th className="py-2.5 pr-3">Phone</th>
                      <th className="py-2.5 pr-3">Status</th>
                      <th className="py-2.5 pr-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((e) => (
                      <tr key={e.id} className={`border-b border-[var(--color-border-subtle)] ${editingId === e.id ? 'bg-[var(--color-primary-light)]' : 'hover:bg-slate-50/50'}`}>
                        <td className="py-2.5 pr-3 font-mono text-xs">{e.employeeCode}</td>
                        <td className="py-2.5 pr-3 font-medium text-[var(--color-text-primary)]">{e.firstName} {e.lastName}</td>
                        <td className="py-2.5 pr-3 text-[var(--color-text-secondary)]">{e.email}</td>
                        <td className="py-2.5 pr-3 text-[var(--color-text-secondary)] whitespace-nowrap">{formatPhone(e.phone)}</td>
                        <td className="py-2.5 pr-3">
                          <Badge variant={e.isActive ? 'success' : 'default'} size="sm">{e.employmentStatus}</Badge>
                        </td>
                        <td className="py-2.5 pr-3">
                          {confirmId === e.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs text-[var(--color-text-secondary)]">Delete?</span>
                              <button onClick={confirmDelete} className="text-xs rounded px-2.5 py-1 bg-[var(--color-danger)] text-white hover:opacity-90 font-medium">Yes</button>
                              <button onClick={() => setConfirmId(null)} className="text-xs rounded px-2 py-1 border border-[var(--color-border)] hover:bg-[var(--color-border-subtle)]">No</button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-3">
                              <button onClick={() => startEdit(e)} className="text-xs text-[var(--color-primary)] font-medium hover:underline">Edit</button>
                              <button onClick={() => { setConfirmId(e.id); setMsg(null); }} className="text-xs text-[var(--color-danger)] hover:underline">Delete</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {visible.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[var(--color-text-muted)]">
                          {q || statusFilter !== 'all' ? 'No employees match this search filter.' : 'No employees rostered yet.'}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit employee' : 'Add new employee'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name"><TextInput value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required /></Field>
                  <Field label="Last name"><TextInput value={form.lastName} onChange={(e) => set('lastName', e.target.value)} required /></Field>
                </div>
                <Field label="Work Email"><TextInput type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Employee code"><TextInput value={form.employeeCode} onChange={(e) => set('employeeCode', e.target.value)} placeholder="EMP-1005" required /></Field>
                  <Field label="Phone"><TextInput value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="2075550105" /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Employment status">
                    <Select value={form.employmentStatus} onChange={(e) => set('employmentStatus', e.target.value)}>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contractor">Contractor</option>
                    </Select>
                  </Field>
                  <Field label="Hire date"><TextInput type="date" value={form.hireDate} onChange={(e) => set('hireDate', e.target.value)} /></Field>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 rounded-lg bg-[var(--color-primary)] text-white px-4 py-2.5 font-medium hover:bg-[var(--color-primary-hover)] shadow-sm transition-colors cursor-pointer">
                    {editingId ? 'Save changes' : 'Add employee'}
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

'use client';

import { useState } from 'react';
import { useApp } from '@/lib/app-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader, Field, TextInput, Select, Alert } from '@/components/form';

const empty = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  employeeCode: '',
  employmentStatus: 'full-time',
  hireDate: new Date().toISOString().slice(0, 10),
};

export default function EmployeesPage() {
  const { employees, companyId, addEmployee } = useApp();
  const [form, setForm] = useState({ ...empty });
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  function set(k: keyof typeof empty, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.employeeCode.trim()) {
      setMsg({ kind: 'error', text: 'First name, last name, email and employee code are required.' });
      return;
    }
    if (employees.some((x) => x.email.toLowerCase() === form.email.trim().toLowerCase())) {
      setMsg({ kind: 'error', text: 'An employee with that email already exists.' });
      return;
    }
    addEmployee({
      companyId,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || '0000000000',
      employeeCode: form.employeeCode.trim(),
      employmentStatus: form.employmentStatus,
      hireDate: form.hireDate,
      isActive: true,
    });
    setMsg({ kind: 'success', text: `${form.firstName} ${form.lastName} added to the roster.` });
    setForm({ ...empty });
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <PageHeader title="Employees" subtitle="Roster of care staff. New hires flow into scheduling and timesheets." />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Roster ({employees.length})</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                    <th className="py-2 pr-3">Code</th>
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((e) => (
                    <tr key={e.id} className="border-b border-[var(--color-border-subtle)]">
                      <td className="py-2 pr-3 font-mono text-xs">{e.employeeCode}</td>
                      <td className="py-2 pr-3">{e.firstName} {e.lastName}</td>
                      <td className="py-2 pr-3 text-[var(--color-text-secondary)]">{e.email}</td>
                      <td className="py-2 pr-3">
                        <Badge variant={e.isActive ? 'success' : 'default'} size="sm">{e.employmentStatus}</Badge>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 ? (
                    <tr><td colSpan={4} className="py-6 text-center text-[var(--color-text-muted)]">No employees yet.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Add employee</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="flex flex-col gap-3">
                {msg ? <Alert kind={msg.kind}>{msg.text}</Alert> : null}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name"><TextInput value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required /></Field>
                  <Field label="Last name"><TextInput value={form.lastName} onChange={(e) => set('lastName', e.target.value)} required /></Field>
                </div>
                <Field label="Email"><TextInput type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Employee code"><TextInput value={form.employeeCode} onChange={(e) => set('employeeCode', e.target.value)} placeholder="EMP-1005" required /></Field>
                  <Field label="Phone"><TextInput value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="9165550105" /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Status">
                    <Select value={form.employmentStatus} onChange={(e) => set('employmentStatus', e.target.value)}>
                      <option value="full-time">full-time</option>
                      <option value="part-time">part-time</option>
                      <option value="contractor">contractor</option>
                    </Select>
                  </Field>
                  <Field label="Hire date"><TextInput type="date" value={form.hireDate} onChange={(e) => set('hireDate', e.target.value)} /></Field>
                </div>
                <button type="submit" className="mt-1 rounded-md bg-[var(--color-primary)] text-white px-4 py-2.5 font-medium hover:bg-[var(--color-primary-hover)]">
                  Add employee
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

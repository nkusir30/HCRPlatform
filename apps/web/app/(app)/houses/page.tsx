'use client';

import { useState } from 'react';
import { useApp } from '@/lib/app-store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader, Field, TextInput, Alert } from '@/components/form';

const empty = {
  name: '',
  code: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'USA',
  phone: '',
  email: '',
  managerName: '',
  managerPhone: '',
};

type FormState = typeof empty;

export default function HousesPage() {
  const { houses, companyId, addHouse } = useApp();
  const [form, setForm] = useState<FormState>({ ...empty });
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  function set(k: keyof FormState, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!form.name.trim() || !form.code.trim() || !form.address1.trim() || !form.city.trim() || !form.state.trim() || !form.postalCode.trim() || !form.country.trim()) {
      setMsg({ kind: 'error', text: 'Name, code, address, city, state, ZIP and country are required.' });
      return;
    }
    if (houses.some((h) => h.code.toLowerCase() === form.code.trim().toLowerCase())) {
      setMsg({ kind: 'error', text: 'A house with that code already exists.' });
      return;
    }
    addHouse({
      companyId,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      address1: form.address1.trim(),
      address2: form.address2.trim() || undefined,
      city: form.city.trim(),
      state: form.state.trim().toUpperCase(),
      postalCode: form.postalCode.trim(),
      country: form.country.trim(),
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      managerName: form.managerName.trim() || undefined,
      managerPhone: form.managerPhone.trim() || undefined,
    });
    setMsg({ kind: 'success', text: `${form.name.trim()} added. It now appears when scheduling shifts.` });
    setForm({ ...empty });
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <PageHeader title="Houses" subtitle="Residential care locations. New houses flow into the schedule form." />

      {msg ? <div className="mb-4"><Alert kind={msg.kind}>{msg.text}</Alert></div> : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Houses ({houses.length})</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                    <th className="py-2 pr-3">Code</th>
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Location</th>
                    <th className="py-2 pr-3">Manager</th>
                  </tr>
                </thead>
                <tbody>
                  {houses.map((h) => (
                    <tr key={h.id} className="border-b border-[var(--color-border-subtle)]">
                      <td className="py-2 pr-3"><Badge size="sm">{h.code}</Badge></td>
                      <td className="py-2 pr-3 font-medium">{h.name}</td>
                      <td className="py-2 pr-3 text-[var(--color-text-secondary)]">{h.city}, {h.state}</td>
                      <td className="py-2 pr-3 text-[var(--color-text-secondary)]">{h.managerName ?? '—'}</td>
                    </tr>
                  ))}
                  {houses.length === 0 ? (
                    <tr><td colSpan={4} className="py-6 text-center text-[var(--color-text-muted)]">No houses yet.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Add house</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Name"><TextInput value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Maple House" required /></Field>
                  <Field label="Code"><TextInput value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="MAPLE" required /></Field>
                </div>
                <Field label="Address"><TextInput value={form.address1} onChange={(e) => set('address1', e.target.value)} placeholder="123 Main St" required /></Field>
                <Field label="Address 2"><TextInput value={form.address2} onChange={(e) => set('address2', e.target.value)} placeholder="Optional" /></Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="City"><TextInput value={form.city} onChange={(e) => set('city', e.target.value)} required /></Field>
                  <Field label="State"><TextInput value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="CA" maxLength={2} required /></Field>
                  <Field label="ZIP"><TextInput value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} placeholder="95814" required /></Field>
                </div>
                <Field label="Country"><TextInput value={form.country} onChange={(e) => set('country', e.target.value)} required /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Phone"><TextInput value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="9165550110" /></Field>
                  <Field label="Email"><TextInput type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="house@hrv-homes.com" /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Manager name"><TextInput value={form.managerName} onChange={(e) => set('managerName', e.target.value)} placeholder="Jane Doe" /></Field>
                  <Field label="Manager phone"><TextInput value={form.managerPhone} onChange={(e) => set('managerPhone', e.target.value)} placeholder="9165550177" /></Field>
                </div>
                <button type="submit" className="mt-1 rounded-md bg-[var(--color-primary)] text-white px-4 py-2.5 font-medium hover:bg-[var(--color-primary-hover)]">
                  Add house
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

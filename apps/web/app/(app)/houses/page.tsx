'use client';

import { useState } from 'react';
import { useApp } from '@/lib/app-store';
import type { House } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader, Field, TextInput, Alert } from '@/components/form';
import { Download, Search, X, Home } from 'lucide-react';

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
  const { houses, companyId, addHouse, updateHouse, deleteHouse } = useApp();
  const [form, setForm] = useState<FormState>({ ...empty });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const q = search.trim().toLowerCase();
  const visible = q
    ? houses.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.code.toLowerCase().includes(q) ||
          h.city.toLowerCase().includes(q) ||
          (h.managerName && h.managerName.toLowerCase().includes(q)),
      )
    : houses;

  function set(k: keyof FormState, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function startEdit(h: House) {
    setEditingId(h.id);
    setConfirmId(null);
    setMsg(null);
    setForm({
      name: h.name,
      code: h.code,
      address1: h.address1,
      address2: h.address2 ?? '',
      city: h.city,
      state: h.state,
      postalCode: h.postalCode,
      country: h.country,
      phone: h.phone ?? '',
      email: h.email ?? '',
      managerName: h.managerName ?? '',
      managerPhone: h.managerPhone ?? '',
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
    if (!form.name.trim() || !form.code.trim() || !form.address1.trim() || !form.city.trim() || !form.state.trim() || !form.postalCode.trim() || !form.country.trim()) {
      setMsg({ kind: 'error', text: 'Name, code, address, city, state, ZIP and country are required.' });
      return;
    }
    const dup = houses.some((h) => h.code.toLowerCase() === form.code.trim().toUpperCase().toLowerCase() && h.id !== editingId);
    if (dup) {
      setMsg({ kind: 'error', text: 'A house with that code already exists.' });
      return;
    }
    const payload = {
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
    };

    if (editingId) {
      updateHouse(editingId, payload);
      setMsg({ kind: 'success', text: `${payload.name} updated.` });
      cancelEdit();
      return;
    }

    addHouse(payload);
    setMsg({ kind: 'success', text: `${form.name.trim()} added. It now appears across scheduling and shifts.` });
    setForm({ ...empty });
  }

  function confirmDelete() {
    if (!confirmId) return;
    const house = houses.find((h) => h.id === confirmId);
    deleteHouse(confirmId);
    setConfirmId(null);
    if (editingId === confirmId) cancelEdit();
    setMsg({ kind: 'success', text: `${house ? house.name : 'House'} removed.` });
  }

  function exportCSV() {
    const header = ['Code', 'Name', 'Address', 'City', 'State', 'ZIP', 'Phone', 'Manager'];
    const rows = visible.map((h) => [
      `"${h.code}"`,
      `"${h.name}"`,
      `"${h.address1}"`,
      `"${h.city}"`,
      `"${h.state}"`,
      `"${h.postalCode}"`,
      `"${h.phone || ''}"`,
      `"${h.managerName || ''}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `hcr_houses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Houses"
        subtitle="Residential community care locations. New houses flow directly into the shift schedule form."
        action={
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-text-primary)] transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-teal-600" />
            <span>Export Houses CSV</span>
          </button>
        }
      />

      {msg ? <div className="mb-4"><Alert kind={msg.kind}>{msg.text}</Alert></div> : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Houses ({visible.length}{q ? ` of ${houses.length}` : ''})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="mb-3 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search house name, code, city, manager…"
                  aria-label="Search houses"
                  className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                    <th className="py-2.5 pr-3">Code</th>
                    <th className="py-2.5 pr-3">Name</th>
                    <th className="py-2.5 pr-3">Location</th>
                    <th className="py-2.5 pr-3">Manager</th>
                    <th className="py-2.5 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((h) => (
                    <tr key={h.id} className={`border-b border-[var(--color-border-subtle)] ${editingId === h.id ? 'bg-[var(--color-primary-light)]' : 'hover:bg-slate-50/50'}`}>
                      <td className="py-2.5 pr-3"><Badge size="sm">{h.code}</Badge></td>
                      <td className="py-2.5 pr-3 font-semibold text-[var(--color-text-primary)]">{h.name}</td>
                      <td className="py-2.5 pr-3 text-[var(--color-text-secondary)]">{h.city}, {h.state}</td>
                      <td className="py-2.5 pr-3 text-[var(--color-text-secondary)]">{h.managerName ?? '—'}</td>
                      <td className="py-2.5 pr-3">
                        {confirmId === h.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-[var(--color-text-secondary)]">Delete?</span>
                            <button onClick={confirmDelete} className="text-xs rounded px-2.5 py-1 bg-[var(--color-danger)] text-white hover:opacity-90 font-medium">Yes</button>
                            <button onClick={() => setConfirmId(null)} className="text-xs rounded px-2 py-1 border border-[var(--color-border)] hover:bg-[var(--color-border-subtle)]">No</button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => startEdit(h)} className="text-xs text-[var(--color-primary)] font-medium hover:underline">Edit</button>
                            <button onClick={() => { setConfirmId(h.id); setMsg(null); }} className="text-xs text-[var(--color-danger)] hover:underline">Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {visible.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-[var(--color-text-muted)]">{q ? 'No houses match this search.' : 'No houses registered yet.'}</td></tr>
                  ) : null}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit house location' : 'Add new house'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Name"><TextInput value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Maple House" required /></Field>
                  <Field label="Code"><TextInput value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="MAPLE" required /></Field>
                </div>
                <Field label="Address"><TextInput value={form.address1} onChange={(e) => set('address1', e.target.value)} placeholder="123 Main St" required /></Field>
                <Field label="Address line 2"><TextInput value={form.address2} onChange={(e) => set('address2', e.target.value)} placeholder="Suite, Apt (Optional)" /></Field>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="City"><TextInput value={form.city} onChange={(e) => set('city', e.target.value)} required /></Field>
                  <Field label="State"><TextInput value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="ME" maxLength={2} required /></Field>
                  <Field label="ZIP"><TextInput value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} placeholder="04101" required /></Field>
                </div>
                <Field label="Country"><TextInput value={form.country} onChange={(e) => set('country', e.target.value)} required /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Phone"><TextInput value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="2075550110" /></Field>
                  <Field label="Email"><TextInput type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="house@hrv-homes.com" /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Manager name"><TextInput value={form.managerName} onChange={(e) => set('managerName', e.target.value)} placeholder="Jane Doe" /></Field>
                  <Field label="Manager phone"><TextInput value={form.managerPhone} onChange={(e) => set('managerPhone', e.target.value)} placeholder="2075550177" /></Field>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="flex-1 rounded-lg bg-[var(--color-primary)] text-white px-4 py-2.5 font-medium hover:bg-[var(--color-primary-hover)] shadow-xs transition-colors cursor-pointer">
                    {editingId ? 'Save changes' : 'Add house'}
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

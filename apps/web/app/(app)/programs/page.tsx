'use client';

import { useState } from 'react';
import { useApp } from '@/lib/app-store';
import type { Program } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader, Field, TextInput, Select, Alert } from '@/components/form';

const empty = {
  name: '',
  code: '',
  description: '',
  houseId: '',
  active: 'true',
};

type FormState = typeof empty;

export default function ProgramsPage() {
  const { programs, houses, companyId, addProgram, updateProgram, deleteProgram } = useApp();
  const [form, setForm] = useState<FormState>({ ...empty });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  function set(k: keyof FormState, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const houseName = (id?: string) => (id ? houses.find((h) => h.id === id)?.name ?? '—' : 'All houses');

  function startEdit(p: Program) {
    setEditingId(p.id);
    setConfirmId(null);
    setMsg(null);
    setForm({
      name: p.name,
      code: p.code,
      description: p.description ?? '',
      houseId: p.houseId ?? '',
      active: p.active ? 'true' : 'false',
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
    if (!form.name.trim() || !form.code.trim()) {
      setMsg({ kind: 'error', text: 'Program name and code are required.' });
      return;
    }
    if (programs.some((p) => p.code.toLowerCase() === form.code.trim().toLowerCase() && p.id !== editingId)) {
      setMsg({ kind: 'error', text: 'A program with that code already exists.' });
      return;
    }
    const fields = {
      companyId,
      houseId: form.houseId || undefined,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || undefined,
      active: form.active === 'true',
    };

    if (editingId) {
      const current = programs.find((p) => p.id === editingId);
      updateProgram(editingId, {
        ...fields,
        programId: current?.programId ?? `PRG-2026-${fields.code}`,
      });
      setMsg({ kind: 'success', text: `${fields.name} updated.` });
      cancelEdit();
      return;
    }

    const count = programs.length + 1;
    addProgram({
      ...fields,
      programId: `PRG-2026-${fields.code}`,
    });
    setMsg({ kind: 'success', text: `Program #${count} created: ${fields.name}.` });
    setForm({ ...empty });
  }

  function confirmDelete() {
    if (!confirmId) return;
    const program = programs.find((p) => p.id === confirmId);
    deleteProgram(confirmId);
    setConfirmId(null);
    if (editingId === confirmId) cancelEdit();
    setMsg({ kind: 'success', text: `${program ? program.name : 'Program'} removed.` });
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <PageHeader title="Programs" subtitle="Care programs offered at your houses. Assign employees to programs." />

      {msg ? <div className="mb-4"><Alert kind={msg.kind}>{msg.text}</Alert></div> : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Programs ({programs.length})</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                    <th className="py-2 pr-3">Code</th>
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">House</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((p) => (
                    <tr key={p.id} className={`border-b border-[var(--color-border-subtle)] ${editingId === p.id ? 'bg-[var(--color-primary-light)]' : ''}`}>
                      <td className="py-2 pr-3"><Badge size="sm">{p.code}</Badge></td>
                      <td className="py-2 pr-3">
                        <div className="font-medium">{p.name}</div>
                        {p.description ? <div className="text-xs text-[var(--color-text-muted)]">{p.description}</div> : null}
                      </td>
                      <td className="py-2 pr-3 text-[var(--color-text-secondary)]">{houseName(p.houseId)}</td>
                      <td className="py-2 pr-3">
                        {p.active
                          ? <Badge variant="success" size="sm">Active</Badge>
                          : <Badge size="sm">Inactive</Badge>}
                      </td>
                      <td className="py-2 pr-3">
                        {confirmId === p.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-[var(--color-text-secondary)]">Delete?</span>
                            <button onClick={confirmDelete} className="text-xs rounded px-2 py-1 bg-[var(--color-danger)] text-white hover:opacity-90">Yes</button>
                            <button onClick={() => setConfirmId(null)} className="text-xs rounded px-2 py-1 border border-[var(--color-border)] hover:bg-[var(--color-border-subtle)]">No</button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => startEdit(p)} className="text-xs text-[var(--color-primary)] hover:underline">Edit</button>
                            <button onClick={() => { setConfirmId(p.id); setMsg(null); }} className="text-xs text-[var(--color-danger)] hover:underline">Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {programs.length === 0 ? (
                    <tr><td colSpan={5} className="py-6 text-center text-[var(--color-text-muted)]">No programs yet.</td></tr>
                  ) : null}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit program' : 'Add program'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="flex flex-col gap-3">
                <Field label="Name"><TextInput value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Companionship Care" required /></Field>
                <Field label="Code"><TextInput value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="COMP" required /></Field>
                <Field label="Description"><TextInput value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Optional summary" /></Field>
                <Field label="House">
                  <Select value={form.houseId} onChange={(e) => set('houseId', e.target.value)}>
                    <option value="">All houses</option>
                    {houses.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Status">
                  <Select value={form.active} onChange={(e) => set('active', e.target.value)}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </Select>
                </Field>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 rounded-md bg-[var(--color-primary)] text-white px-4 py-2.5 font-medium hover:bg-[var(--color-primary-hover)]">
                    {editingId ? 'Save changes' : 'Create program'}
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

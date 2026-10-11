'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, DEMO_ACCOUNTS, DEMO_PASSWORD } from '@/lib/app-store';
import { AttendanceClock } from '@/components/attendance-clock';
import { Field, TextInput, Select, Alert } from '@/components/form';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const { login, signup, session, hydrated, accounts, logout } = useApp();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');

  // Sign-in state
  const [email, setEmail] = useState('admin@hrv-homes.com');
  const [password, setPassword] = useState(DEMO_PASSWORD);

  // Sign-up state
  const [su, setSu] = useState({ name: '', email: '', password: '', confirm: '', role: 'employee' as 'employee' | 'manager' | 'admin' });

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Employees stay on this page to use the real-time Time & Attendance clock
  // (their shift for today). Everyone else is sent to the dashboard.
  const isEmployee = session?.role === 'employee';

  useEffect(() => {
    if (hydrated && session && !isEmployee) router.replace('/dashboard');
  }, [hydrated, session, isEmployee, router]);

  function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = login(email, password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? 'Login failed.');
      return;
    }
    // Employees stay here for the Time & Attendance clock; the effect above
    // handles redirecting everyone else to the dashboard.
    const acct = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (acct?.role !== 'employee') router.replace('/dashboard');
  }

  function onSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (su.password !== su.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    const res = signup({ name: su.name, email: su.email, password: su.password, role: su.role });
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? 'Sign up failed.');
      return;
    }
    if (su.role !== 'employee') router.replace('/dashboard');
  }

  // A logged-in employee gets the Time & Attendance clock on this page. Gate on
  // `hydrated` so the first client render matches the server render (Loading)
  // — the store only reads localStorage after mount — avoiding a hydration
  // mismatch. While hydrating (or a non-employee mid-redirect) show a neutral
  // state that matches the server render to avoid a hydration mismatch.
  if (hydrated && session && isEmployee) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-bg-base">
        <div className="w-full max-w-lg">
          <div className="text-center mb-6">
            <img src="/hcr-logo.svg" alt="Home Care Residential, LLC" className="mx-auto mb-4 w-full max-w-xs" />
          </div>
          <AttendanceClock />
          <div className="mt-6 flex items-center justify-center text-sm">
            <button
              type="button"
              onClick={() => { logout(); router.replace('/login'); }}
              className="text-[var(--color-danger)] hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hydrated || session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-[var(--color-text-secondary)]">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-base">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/hcr-logo.svg"
            alt="Home Care Residential, LLC — Home Is Where We Are Safe And Loved."
            className="mx-auto mb-4 w-full max-w-sm"
          />
          <p className="text-[var(--color-text-secondary)] mt-1">
            {mode === 'signin' ? 'Sign in to the scheduling platform' : 'Create your account'}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-1">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`rounded-md px-3 py-2 text-sm font-medium ${mode === 'signin' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)]'}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`rounded-md px-3 py-2 text-sm font-medium ${mode === 'signup' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-border-subtle)]'}`}
          >
            Sign up
          </button>
        </div>

        {mode === 'signin' ? (
          <form onSubmit={onSignIn} className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm flex flex-col gap-4">
            {error ? <Alert kind="error">{error}</Alert> : null}
            <Field label="Email">
              <TextInput type="email" value={email} autoComplete="username" onChange={(e) => setEmail(e.target.value)} required />
            </Field>
            <Field label="Password">
              <TextInput type="password" value={password} autoComplete="current-password" onChange={(e) => setPassword(e.target.value)} required />
            </Field>
            <button type="submit" disabled={busy} className="rounded-md bg-[var(--color-primary)] text-white px-4 py-2.5 font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        ) : (
          <form onSubmit={onSignUp} className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm flex flex-col gap-4">
            {error ? <Alert kind="error">{error}</Alert> : null}
            <Field label="Full name">
              <TextInput value={su.name} autoComplete="name" onChange={(e) => setSu((s) => ({ ...s, name: e.target.value }))} placeholder="Jane Doe" required />
            </Field>
            <Field label="Email">
              <TextInput type="email" value={su.email} autoComplete="email" onChange={(e) => setSu((s) => ({ ...s, email: e.target.value }))} placeholder="you@hrv-homes.com" required />
            </Field>
            <Field label="Role">
              <Select value={su.role} onChange={(e) => setSu((s) => ({ ...s, role: e.target.value as typeof su.role }))}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </Select>
            </Field>
            <Field label="Password" hint="At least 8 characters">
              <TextInput type="password" value={su.password} autoComplete="new-password" onChange={(e) => setSu((s) => ({ ...s, password: e.target.value }))} required />
            </Field>
            <Field label="Confirm password">
              <TextInput type="password" value={su.confirm} autoComplete="new-password" onChange={(e) => setSu((s) => ({ ...s, confirm: e.target.value }))} required />
            </Field>
            <button type="submit" disabled={busy} className="rounded-md bg-[var(--color-primary)] text-white px-4 py-2.5 font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-60">
              {busy ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        )}

        {mode === 'signin' ? (
          <div className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
            <div className="text-sm font-medium mb-2">Demo accounts</div>
            <div className="flex flex-col gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => { setEmail(a.email); setPassword(DEMO_PASSWORD); setError(null); }}
                  className="text-left text-sm rounded-md px-3 py-2 hover:bg-[var(--color-border-subtle)] border border-transparent hover:border-[var(--color-border)]"
                >
                  <span className="font-medium">{a.name}</span>
                  <span className="text-[var(--color-text-muted)]"> · {a.role.replace('_', ' ')}</span>
                  <div className="text-xs text-[var(--color-text-muted)]">{a.email}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-3">
              Password for all demo accounts: <code className="font-mono">{DEMO_PASSWORD}</code>
            </p>
          </div>
        ) : (
          <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
            Already have an account?{' '}
            <button type="button" onClick={() => { setMode('signin'); setError(null); }} className="text-[var(--color-primary)] hover:underline">
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, DEMO_ACCOUNTS, DEMO_PASSWORD } from '@/lib/app-store';
import { Field, TextInput, Select, Alert } from '@/components/form';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const { login, signup, session, hydrated } = useApp();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');

  // Sign-in state
  const [email, setEmail] = useState('admin@hrv-homes.com');
  const [password, setPassword] = useState(DEMO_PASSWORD);

  // Sign-up state
  const [su, setSu] = useState({ name: '', email: '', password: '', confirm: '', role: 'employee' as 'employee' | 'manager' | 'admin' });

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Already signed in? Go straight to the dashboard (after hydration).
  useEffect(() => {
    if (hydrated && session) router.replace('/dashboard');
  }, [hydrated, session, router]);

  function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = login(email, password);
    setBusy(false);
    if (res.ok) router.replace('/dashboard');
    else setError(res.error ?? 'Login failed.');
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
    if (res.ok) router.replace('/dashboard');
    else setError(res.error ?? 'Sign up failed.');
  }

  // While hydrating (or already logged in and about to redirect), show a neutral
  // state that matches the server render to avoid a hydration mismatch.
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
          <div className="text-5xl mb-3">🏠</div>
          <h1 className="text-2xl font-semibold">Home Care Residential</h1>
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


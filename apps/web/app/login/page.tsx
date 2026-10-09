'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, DEMO_ACCOUNTS, DEMO_PASSWORD } from '@/lib/app-store';
import { Field, TextInput, Alert } from '@/components/form';

export default function LoginPage() {
  const { login, session } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('admin@hrv-homes.com');
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Already signed in? Go straight to the dashboard.
  if (session) {
    router.replace('/dashboard');
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = login(email, password);
    setBusy(false);
    if (res.ok) {
      router.replace('/dashboard');
    } else {
      setError(res.error ?? 'Login failed.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg-base">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏠</div>
          <h1 className="text-2xl font-semibold">Home Care Residential</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Sign in to the scheduling platform</p>
        </div>

        <form onSubmit={onSubmit} className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm flex flex-col gap-4">
          {error ? <Alert kind="error">{error}</Alert> : null}

          <Field label="Email">
            <TextInput
              type="email"
              value={email}
              autoComplete="username"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>

          <Field label="Password">
            <TextInput
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-[var(--color-primary)] text-white px-4 py-2.5 font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-60"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <div className="text-sm font-medium mb-2">Demo accounts</div>
          <div className="flex flex-col gap-2">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => {
                  setEmail(a.email);
                  setPassword(DEMO_PASSWORD);
                  setError(null);
                }}
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
      </div>
    </div>
  );
}

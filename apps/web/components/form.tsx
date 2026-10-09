'use client';

import type { ReactNode, SelectHTMLAttributes, InputHTMLAttributes } from 'react';

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</span>
      {children}
      {hint ? <span className="text-xs text-[var(--color-text-muted)]">{hint}</span> : null}
    </label>
  );
}

const inputCls =
  'rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]';

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ''}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} ${props.className ?? ''}`} />;
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle ? <p className="text-[var(--color-text-secondary)] mt-1">{subtitle}</p> : null}
      </div>
      {action}
    </header>
  );
}

export function Alert({ kind, children }: { kind: 'success' | 'error' | 'info'; children: ReactNode }) {
  const map = {
    success: 'bg-[var(--color-success-light)] text-[var(--color-success)]',
    error: 'bg-[var(--color-danger-light)] text-[var(--color-danger)]',
    info: 'bg-[var(--color-info-light)] text-[var(--color-info)]',
  } as const;
  return <div className={`rounded-md px-3 py-2 text-sm ${map[kind]}`}>{children}</div>;
}

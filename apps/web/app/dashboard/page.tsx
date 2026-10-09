import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiBase } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface Check {
  name: string;
  method: string;
  path: string;
  expect: string;
}

const CHECKS: Check[] = [
  { name: 'API root', method: 'GET', path: '', expect: 'Should return 200 plain text' },
  { name: 'Auth session stub', method: 'POST', path: '/auth/me', expect: 'Should return 201 demo user' },
];

interface Probe {
  name: string;
  method: string;
  path: string;
  ok: boolean;
  status: number;
  ms: number;
  detail: string;
}

async function probe(c: Check): Promise<Probe> {
  const started = Date.now();
  try {
    const res = await fetch(`${apiBase()}${c.path}`, {
      method: c.method,
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    const text = await res.text();
    return {
      name: c.name,
      method: c.method,
      path: c.path || '/',
      ok: res.ok,
      status: res.status,
      ms: Date.now() - started,
      detail: text.replace(/\s+/g, ' ').slice(0, 160) || '(empty body)',
    };
  } catch (e) {
    return {
      name: c.name,
      method: c.method,
      path: c.path || '/',
      ok: false,
      status: 0,
      ms: Date.now() - started,
      detail: e instanceof Error ? e.message : 'network error',
    };
  }
}

export default async function DashboardPage() {
  const results = await Promise.all(CHECKS.map(probe));
  const live = results.filter((r) => r.ok).length;

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">Home Care Residential</p>
          <h1 className="text-3xl font-semibold">Live platform dashboard</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Server-rendered health checks against the real API — no mocks. Refetches on every page load.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={live === results.length ? 'success' : live > 0 ? 'warning' : 'danger'}>
            {live}/{results.length} live
          </Badge>
          <Link href="/" className="text-sm underline underline-offset-4">
            ← Home
          </Link>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {results.map((r) => (
          <Card key={r.name} variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>{r.name}</CardTitle>
                <Badge variant={r.ok ? 'success' : 'danger'} size="sm">
                  {r.ok ? 'LIVE' : r.status === 0 ? 'UNREACHABLE' : `HTTP ${r.status}`}
                </Badge>
              </div>
              <CardDescription>
                {r.method} {r.path} · {r.ms}ms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm break-words text-[var(--color-text-secondary)]">{r.detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>What&apos;s next</CardTitle>
          <CardDescription>Grow this into the full operator console</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-sm list-disc pl-5 space-y-1 text-[var(--color-text-secondary)]">
            <li>
              Sign in at <Link href="/auth" className="underline underline-offset-4">/auth</Link> against{' '}
              <code>POST /api/auth/login</code>, then store the JWT for guarded routes.
            </li>
            <li>
              Guarded endpoints (<code>/api/users</code>, org timesheets, schedules, payroll) need a real org id + token —
              wire the token from the login response into an Authorization header.
            </li>
            <li>
              This page renders server-side on every load (<code>force-dynamic</code>), so it doubles as a deploy smoke test
              on Render: if the API env is wrong, the badges go red immediately.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

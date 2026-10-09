import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <div className="text-5xl">🏠</div>
      <h1 className="text-3xl font-semibold text-center">
        Home Care Residential — Payroll &amp; HR
      </h1>
      <p className="text-center max-w-xl text-[var(--color-text-secondary)]">
        Dynamic preview is live. The API is running on port 4000 and the web app
        on port 3000.
      </p>
      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="rounded-md bg-[var(--color-primary)] text-white px-5 py-2.5 hover:bg-[var(--color-primary-hover)]"
        >
          Open dashboard
        </Link>
        <a
          href="http://localhost:4000/api"
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-[var(--color-border)] px-5 py-2.5"
        >
          API status
        </a>
      </div>
    </div>
  );
}


'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/app-store';

export default function HomePage() {
  const { session, hydrated } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (hydrated) router.replace(session ? '/dashboard' : '/login');
  }, [hydrated, session, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
      <div className="text-5xl">🏠</div>
      <h1 className="text-2xl font-semibold text-center">Home Care Residential</h1>
      <p className="text-center text-[var(--color-text-secondary)]">Loading your workspace…</p>
    </div>
  );
}



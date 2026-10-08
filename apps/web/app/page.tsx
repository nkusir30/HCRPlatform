import type { NextPage } from 'next';
import { redirect } from 'next/navigation';

// Pages rendered at / for role-based routing
export default function HomePage() {
  // Redirect to the role-specific dashboard after login is handled by AuthProvider
  // This component is a placeholder for future route-guarded shell
  return null;
}

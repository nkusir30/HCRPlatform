import type { Metadata } from 'next';
import '@/styles/global.css';
import { ClientProviders } from './providers';

export const metadata: Metadata = {
  title: { default: 'Home Care Residential — Payroll & HR SaaS', template: '%s | HCR' },
  description: 'Payroll, scheduling, timesheet, and HR management for Home Care Residential',
  icons: { icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏠</text></svg>' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          <main className="flex-1 min-h-screen bg-bg-base">
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}

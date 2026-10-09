'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query-client';
import { StoreProvider } from '@/providers/store-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppStoreProvider } from '@/lib/app-store';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <AppStoreProvider>
        <StoreProvider>
          <AuthProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </AuthProvider>
        </StoreProvider>
      </AppStoreProvider>
    </QueryClientProvider>
  );
}


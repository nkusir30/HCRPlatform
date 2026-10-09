import * as React from 'react';
import { clsx } from 'clsx';
import { cn } from '@/lib/utils';

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children, isOpen = true, onClose, ...props }, ref) => (
    <aside
      ref={ref}
      className={clsx(
        'fixed top-0 left-0 z-50 h-full bg-sidebar/95 backdrop-blur-md border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏠</span>
          <span className="font-semibold text-lg text-sidebar-foreground">HCR</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-sidebar-border"
          aria-label="Close sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {children}
      </div>
    </aside>
  ),
);
Sidebar.displayName = 'Sidebar';

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

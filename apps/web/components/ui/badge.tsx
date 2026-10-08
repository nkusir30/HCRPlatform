import * as React from 'react';
import { clsx } from 'clsx';
import { cn } from '@/lib/utils';

export interface SeparatorProps extends React.HTMLAttributes<HTMLHrElement> {}

export const Separator = React.forwardRef<HTMLHrElement, SeparatorProps>(
  ({ className, ...props }, ref) => (
    <hr
      ref={ref}
      className={clsx('border-border/50', className)}
      {...props}
    />
  ),
);
Separator.displayName = 'Separator';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'muted';
  size?: 'sm' | 'md';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants: Record<string, string> = {
      default: 'bg-primary/10 text-primary border-primary/20',
      secondary: 'bg-secondary/10 text-secondary border-secondary/20',
      success: 'bg-success/10 text-success border-success/20',
      danger: 'bg-danger/10 text-danger border-danger/20',
      warning: 'bg-warning/10 text-warning border-warning/20',
      info: 'bg-info/10 text-info border-info/20',
      muted: 'bg-muted/10 text-muted border-muted/20',
    };
    const sizes: Record<string, string> = {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-sm px-2.5 py-1',
    };
    return (
      <span
        ref={ref}
        className={clsx(
          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium transition-colors',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  },
);
Badge.displayName = 'Badge';

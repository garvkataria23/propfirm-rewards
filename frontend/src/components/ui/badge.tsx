import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-violet-500/10 text-violet-600 dark:text-violet-300 border-violet-500/25',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
    danger: 'bg-rose-500/10 text-rose-500 border-rose-500/25',
    info: 'bg-sky-500/10 text-sky-500 border-sky-500/25',
    purple: 'bg-purple-600/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
    outline: 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow' | 'gray';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  blue: 'badge-blue',
  green: 'badge-green',
  purple: 'badge-purple',
  orange: 'badge-orange',
  red: 'badge-red',
  yellow: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25',
  gray: 'bg-slate-500/15 text-slate-400 border border-slate-500/25',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'blue',
  className,
  dot,
}) => (
  <span className={cn('badge', variantStyles[variant], className)}>
    {dot && (
      <span className={cn('w-1.5 h-1.5 rounded-full inline-block', {
        'bg-blue-400': variant === 'blue',
        'bg-emerald-400': variant === 'green',
        'bg-violet-400': variant === 'purple',
        'bg-orange-400': variant === 'orange',
        'bg-red-400': variant === 'red',
        'bg-yellow-400': variant === 'yellow',
        'bg-slate-400': variant === 'gray',
      })} />
    )}
    {children}
  </span>
);

export function toxicityBadge(level: 'low' | 'medium' | 'high') {
  const map = { low: 'green', medium: 'orange', high: 'red' } as const;
  return <Badge variant={map[level]} dot>{level.toUpperCase()}</Badge>;
}

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'blue' | 'purple' | 'green' | 'none';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  glow = 'none',
  onClick,
}) => {
  const glowStyles = {
    blue: 'hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.12)]',
    purple: 'hover:border-violet-500/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.12)]',
    green: 'hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.12)]',
    none: '',
  };

  return (
    <motion.div
      whileHover={hover ? { y: -3 } : undefined}
      onClick={onClick}
      className={cn(
        'glass-card',
        hover && 'cursor-pointer',
        glow !== 'none' && glowStyles[glow],
        className
      )}
    >
      {children}
    </motion.div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon: React.ReactNode;
  color?: 'blue' | 'purple' | 'green' | 'orange';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  positive = true,
  icon,
  color = 'blue',
}) => {
  const colors = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    purple: { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
    green: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  };

  const c = colors[color];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn('stat-card border', c.border)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', c.bg, c.text)}>
          {icon}
        </div>
        {change && (
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full',
            positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          )}>
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-slate-400">{title}</p>
    </motion.div>
  );
};

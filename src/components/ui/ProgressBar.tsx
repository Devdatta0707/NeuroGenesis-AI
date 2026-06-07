import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0–1
  label?: string;
  showValue?: boolean;
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'red';
  size?: 'sm' | 'md';
}

const colorMap = {
  blue: 'from-blue-600 to-blue-400',
  purple: 'from-violet-600 to-violet-400',
  green: 'from-emerald-600 to-emerald-400',
  orange: 'from-orange-600 to-orange-400',
  red: 'from-red-600 to-red-400',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showValue = true,
  color = 'blue',
  size = 'md',
}) => {
  const pct = Math.min(Math.max(value, 0), 1);

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-slate-400">{label}</span>}
          {showValue && (
            <span className="text-xs font-semibold text-slate-300">{(pct * 100).toFixed(0)}%</span>
          )}
        </div>
      )}
      <div className={cn('progress-bar', size === 'sm' ? 'h-1' : 'h-1.5')}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={cn('progress-fill bg-gradient-to-r', colorMap[color])}
        />
      </div>
    </div>
  );
};

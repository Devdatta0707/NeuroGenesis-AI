import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  icon,
  iconRight,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent';

  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 focus:ring-blue-500 shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 hover:-translate-y-0.5',
    secondary: 'bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/50 focus:ring-blue-500',
    ghost: 'text-slate-400 hover:text-white hover:bg-white/5 focus:ring-slate-500',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 focus:ring-red-500',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 focus:ring-emerald-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={cn(base, variants[variant], sizes[size], (disabled || loading) && 'opacity-50 cursor-not-allowed pointer-events-none', className)}
      disabled={disabled || loading}
      type={props.type || 'button'}
      onClick={props.onClick as React.MouseEventHandler<HTMLButtonElement>}
      onFocus={props.onFocus as React.FocusEventHandler<HTMLButtonElement>}
      onBlur={props.onBlur as React.FocusEventHandler<HTMLButtonElement>}
      title={props.title}
      aria-label={props['aria-label']}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
      {iconRight}
    </motion.button>
  );
};

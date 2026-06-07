import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  iconRight,
  className,
  ...props
}) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
    )}
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        className={cn(
          'w-full bg-[#0d1530]/80 border border-blue-500/20 text-white placeholder-slate-500',
          'rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200',
          'focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10',
          'hover:border-blue-500/30',
          icon && 'pl-10',
          iconRight && 'pr-10',
          error && 'border-red-500/50 focus:border-red-500/70',
          className
        )}
        {...props}
      />
      {iconRight && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          {iconRight}
        </div>
      )}
    </div>
    {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
  </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className,
  ...props
}) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
    )}
    <textarea
      className={cn(
        'w-full bg-[#0d1530]/80 border border-blue-500/20 text-white placeholder-slate-500',
        'rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 resize-none',
        'focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10',
        'font-mono',
        error && 'border-red-500/50',
        className
      )}
      {...props}
    />
    {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
  </div>
);

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  subtitle?: string;
  accent?: 'brand' | 'cyan' | 'emerald' | 'amber' | 'rose';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  subtitle,
  accent = 'brand'
}) => {
  const accentGlow = {
    brand: 'hover:border-brand-500/50 hover:shadow-glow',
    cyan: 'hover:border-accent-cyan/50 hover:shadow-glow-cyan',
    emerald: 'hover:border-accent-emerald/50 hover:shadow-glow-emerald',
    amber: 'hover:border-accent-amber/50',
    rose: 'hover:border-accent-rose/50'
  }[accent];

  const accentColor = {
    brand: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
    cyan: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20',
    emerald: 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20',
    amber: 'text-accent-amber bg-accent-amber/10 border-accent-amber/20',
    rose: 'text-accent-rose bg-accent-rose/10 border-accent-rose/20'
  }[accent];

  return (
    <div className={`p-5 rounded-xl bg-surface-100/70 border border-slate-800/80 backdrop-blur-sm transition-all ${accentGlow}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{title}</span>
        <div className={`p-2 rounded-lg border ${accentColor}`}>
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-white font-mono">{value}</span>
        {change && (
          <div className={`flex items-center text-xs font-semibold ${isPositive ? 'text-accent-emerald' : 'text-accent-rose'}`}>
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            <span>{change}</span>
          </div>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>
      )}
    </div>
  );
};

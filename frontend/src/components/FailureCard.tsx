import React from 'react';
import { AlertCircle, Wrench, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { FailureDiagnosis } from '../types/index.js';

interface FailureCardProps {
  diagnosis: FailureDiagnosis;
  onOptimizeClick?: () => void;
}

export const FailureCard: React.FC<FailureCardProps> = ({ diagnosis, onOptimizeClick }) => {
  const severityBadge = {
    high: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    medium: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    low: 'bg-blue-500/10 text-blue-300 border-blue-500/30'
  }[diagnosis.severity];

  return (
    <div className="p-5 rounded-xl bg-surface-100/80 border border-rose-500/30 shadow-sm hover:border-rose-500/50 transition-all space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-semibold text-rose-300 tracking-wide uppercase font-mono">
              Failure Detected
            </span>
            <h4 className="text-sm font-bold text-white mt-0.5">{diagnosis.category}</h4>
          </div>
        </div>

        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-mono font-semibold border ${severityBadge}`}>
          {diagnosis.severity} severity
        </span>
      </div>

      {/* Test Input */}
      <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
        <span className="text-slate-400 block mb-1 font-mono uppercase text-[10px]">Test Query:</span>
        <p className="text-slate-200 italic font-sans font-medium">"{diagnosis.testInput}"</p>
      </div>

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Problem */}
        <div className="p-3 rounded-lg bg-surface-200/60 border border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-rose-300 mb-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Problem</span>
          </div>
          <p className="text-xs text-slate-300">{diagnosis.problem}</p>
        </div>

        {/* Root Cause */}
        <div className="p-3 rounded-lg bg-surface-200/60 border border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-300 mb-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Root Cause</span>
          </div>
          <p className="text-xs text-slate-300">{diagnosis.rootCause}</p>
        </div>

        {/* Recommended Fix */}
        <div className="p-3 rounded-lg bg-surface-200/60 border border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-accent-cyan mb-1">
            <Wrench className="w-3.5 h-3.5" />
            <span>Recommended Fix</span>
          </div>
          <p className="text-xs text-slate-300">{diagnosis.recommendedFix}</p>
        </div>
      </div>

      {/* Output Comparison Diff */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-800">
        <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40">
          <span className="text-[10px] uppercase font-mono font-semibold text-rose-400 block mb-1">
            Actual Agent Output (Failed):
          </span>
          <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-3">
            {diagnosis.agentOutput}
          </p>
        </div>
        <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
          <span className="text-[10px] uppercase font-mono font-semibold text-emerald-400 block mb-1">
            Expected Behavior:
          </span>
          <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-3">
            {diagnosis.expectedBehavior}
          </p>
        </div>
      </div>
    </div>
  );
};

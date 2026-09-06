import React from 'react';
import { CheckCircle2, Circle, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { AOSessionEvent } from '../types/index.js';

interface TimelineProps {
  events?: AOSessionEvent[];
  defaultSteps?: { title: string; subtitle: string; status: 'completed' | 'current' | 'upcoming' | 'failed' }[];
}

export const Timeline: React.FC<TimelineProps> = ({ events, defaultSteps }) => {
  if (events && events.length > 0) {
    return (
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {events.map((ev, idx) => {
          const isDone = ev.status === 'completed';
          const isFailed = ev.status === 'failed';
          const isInProgress = ev.status === 'in-progress';

          return (
            <div key={ev.id || idx} className="relative group">
              {/* Icon Marker */}
              <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                isDone
                  ? 'bg-accent-emerald/20 border-accent-emerald text-accent-emerald shadow-glow-emerald'
                  : isFailed
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                  : isInProgress
                  ? 'bg-brand-500/20 border-brand-500 text-brand-400 animate-pulse'
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}>
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : isFailed ? (
                  <AlertCircle className="w-3 h-3" />
                ) : (
                  <Clock className="w-3 h-3" />
                )}
              </div>

              {/* Content */}
              <div className="p-3.5 rounded-xl bg-surface-100/60 border border-slate-800/80 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white tracking-tight">{ev.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{ev.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const steps = defaultSteps || [
    { title: 'Agent V1 Created', subtitle: 'Requirement analyzed & baseline architecture compiled', status: 'completed' as const },
    { title: 'Testing Lab Executed', subtitle: '50 specialized test cases executed against V1', status: 'completed' as const },
    { title: 'Failures Detected', subtitle: '19 failures diagnosed: replacement-refund intent ambiguity', status: 'completed' as const },
    { title: 'Optimization Completed', subtitle: 'Injected 4 targeted routing rules & policy bounds', status: 'completed' as const },
    { title: 'Agent V2 Created', subtitle: 'Compiled improved configuration & tool bindings', status: 'completed' as const },
    { title: 'Performance Verified', subtitle: 'Accuracy improved from 61.2% to 89.4% (+28.2%)', status: 'completed' as const },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
      {steps.map((step, idx) => (
        <div key={idx} className="p-3 rounded-xl bg-surface-100/70 border border-slate-800/80 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-brand-400">STEP 0{idx + 1}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-white">{step.title}</h5>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{step.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

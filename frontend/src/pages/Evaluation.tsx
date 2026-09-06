import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  FileSearch,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Wrench
} from 'lucide-react';
import { api } from '../services/api.js';
import { Agent, FailureAnalysisReport } from '../types/index.js';
import { FailureCard } from '../components/FailureCard.js';
import { NavigationTab } from '../components/Sidebar.js';

interface EvaluationProps {
  agent: Agent;
  setActiveTab: (tab: NavigationTab) => void;
}

export const Evaluation: React.FC<EvaluationProps> = ({ agent, setActiveTab }) => {
  const [selectedVersion, setSelectedVersion] = useState<number>(1);
  const [report, setReport] = useState<FailureAnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadReport = async () => {
      setIsLoading(true);
      try {
        const res = await api.analyzeFailures(agent.id, selectedVersion);
        if (res.success && res.failureReport) {
          setReport(res.failureReport);
        }
      } catch (err) {
        console.warn('Could not load failure report', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadReport();
  }, [agent.id, selectedVersion]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-semibold">
              Root-Cause Diagnostics
            </span>
            <span className="text-xs text-slate-400">Autonomous Failure Analysis</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Failure Analysis & Diagnostics: {agent.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deep inspection of agent reasoning failures, policy violations, and workflow bottlenecks.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Version Selector */}
          <div className="flex items-center space-x-2 bg-surface-100 border border-slate-700/80 rounded-xl px-3 py-1.5">
            <span className="text-xs text-slate-400 font-medium">Version:</span>
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(parseInt(e.target.value))}
              className="bg-transparent text-white text-xs font-bold font-mono focus:outline-none cursor-pointer"
            >
              {agent.versions.map(v => (
                <option key={v.version} value={v.version} className="bg-surface-200 text-white">
                  {v.versionLabel}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setActiveTab('improvement')}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-emerald hover:from-brand-500 hover:to-emerald-400 text-white text-xs font-bold shadow-glow transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Optimizer (Self-Heal)</span>
          </button>
        </div>
      </div>

      {/* Overview Diagnostic Stats */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-surface-100/70 border border-slate-800 backdrop-blur-sm">
            <span className="text-xs font-medium text-slate-400 block">Total Diagnosed Failures</span>
            <span className="text-2xl font-bold font-mono text-rose-400 mt-1 block">
              {report.totalFailures}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Detected in V{selectedVersion} test runs</span>
          </div>

          <div className="p-5 rounded-2xl bg-surface-100/70 border border-slate-800 backdrop-blur-sm">
            <span className="text-xs font-medium text-slate-400 block">Primary Root Cause</span>
            <span className="text-base font-bold text-amber-300 mt-1 block truncate">
              Intent Classification
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Refund vs Replacement ambiguity</span>
          </div>

          <div className="p-5 rounded-2xl bg-surface-100/70 border border-slate-800 backdrop-blur-sm">
            <span className="text-xs font-medium text-slate-400 block">Policy Breaches</span>
            <span className="text-2xl font-bold font-mono text-rose-400 mt-1 block">
              {report.failureCategories['Policy Violation'] || 2}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">30-day cutoff bypasses</span>
          </div>

          <div className="p-5 rounded-2xl bg-surface-100/70 border border-slate-800 backdrop-blur-sm">
            <span className="text-xs font-medium text-slate-400 block">Healing Feasibility</span>
            <span className="text-2xl font-bold font-mono text-accent-emerald mt-1 block">
              100%
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">Fixable via instruction injection</span>
          </div>
        </div>
      )}

      {/* Summary Banner */}
      {report && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-surface-100 to-surface-200 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider font-mono">
            <FileSearch className="w-4 h-4 text-brand-400" />
            <span>Autonomous Failure Diagnostic Summary</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {report.summary}
          </p>
        </div>
      )}

      {/* Failure Diagnostic Cards (Section 15 Requirements) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Detailed Failure Diagnoses & Recommended Fixes
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {report?.diagnoses.length || 0} Critical Diagnoses
          </span>
        </div>

        {report?.diagnoses && report.diagnoses.length > 0 ? (
          <div className="space-y-4">
            {report.diagnoses.map((diag, i) => (
              <FailureCard
                key={diag.id || i}
                diagnosis={diag}
                onOptimizeClick={() => setActiveTab('improvement')}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-surface-100/40 border border-slate-800 text-center text-slate-400 text-xs">
            No failures diagnosed for this version. Version performance is optimal.
          </div>
        )}
      </div>
    </div>
  );
};

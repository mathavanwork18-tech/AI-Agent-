import React, { useState } from 'react';
import {
  GitBranch,
  Award,
  CheckCircle2,
  Sliders,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCode,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Agent, AgentVersion } from '../types/index.js';
import { NavigationTab } from '../components/Sidebar.js';

interface VersionHistoryProps {
  agent: Agent;
  onUpdateAgent: (agent: Agent) => void;
  setActiveTab: (tab: NavigationTab) => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  agent,
  onUpdateAgent,
  setActiveTab
}) => {
  // Configurable weights matching Section 19
  const [weights, setWeights] = useState({
    accuracy: 0.40,
    policyCompliance: 0.25,
    responseQuality: 0.20,
    reliability: 0.15
  });

  const [selectedForDiff, setSelectedForDiff] = useState<{ vA: number; vB: number }>({
    vA: 1,
    vB: agent.versions.length > 1 ? 2 : 1
  });

  // Calculate dynamic weighted score for a version
  const computeScore = (v: AgentVersion): number => {
    const m = v.metrics;
    if (!m.accuracy) return 0;
    const score =
      m.accuracy * weights.accuracy +
      m.policyCompliance * weights.policyCompliance +
      m.responseQuality * weights.responseQuality +
      m.reliability * weights.reliability;
    return parseFloat(score.toFixed(1));
  };

  // Find best scoring version
  let bestVersion = agent.versions[0];
  let highestScore = -1;
  agent.versions.forEach(v => {
    const s = computeScore(v);
    if (s > highestScore) {
      highestScore = s;
      bestVersion = v;
    }
  });

  const versionA = agent.versions.find(v => v.version === selectedForDiff.vA) || agent.versions[0];
  const versionB = agent.versions.find(v => v.version === selectedForDiff.vB) || agent.versions[agent.versions.length - 1];

  const handleSetActive = (versionNum: number) => {
    const updated = {
      ...agent,
      activeVersion: versionNum
    };
    onUpdateAgent(updated);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono font-semibold">
              Multi-Version Evaluation
            </span>
            <span className="text-xs text-slate-400">Algorithmic Best-Agent Selection</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Version History & Comparison: {agent.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Compare benchmark metrics across iterations and automatically identify the highest-scoring candidate for production deployment.
          </p>
        </div>

        {/* Best Version Badge */}
        <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-accent-emerald/20 to-brand-500/20 border border-accent-emerald/40 flex items-center space-x-3">
          <Award className="w-5 h-5 text-accent-emerald shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block">
              Optimal Version Candidate
            </span>
            <span className="text-xs font-bold text-white">
              {bestVersion.versionLabel} (Composite Score: {computeScore(bestVersion)}/100)
            </span>
          </div>
        </div>
      </div>

      {/* Version Comparison Table (Section 18 Requirements) */}
      <div className="p-6 rounded-2xl bg-surface-100/60 border border-slate-800/80 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Benchmark Performance Matrix</h3>
            <p className="text-xs text-slate-400 mt-0.5">Empirical test suite results across all compiled versions</p>
          </div>
          <span className="text-xs font-mono text-accent-emerald font-semibold">
            +{(bestVersion.metrics.accuracy - agent.versions[0].metrics.accuracy).toFixed(1)}% Accuracy Improvement
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-surface-200/40 text-slate-400 font-mono">
                <th className="py-3 px-4">Metric</th>
                {agent.versions.map(v => (
                  <th key={v.version} className="py-3 px-4 font-bold text-white">
                    <div className="flex items-center space-x-2">
                      <span>{v.versionLabel}</span>
                      {v.version === bestVersion.version && (
                        <span className="px-1.5 py-0.5 rounded bg-accent-emerald/20 text-accent-emerald text-[9px] font-semibold border border-accent-emerald/30">
                          BEST
                        </span>
                      )}
                      {v.version === agent.activeVersion && (
                        <span className="px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 text-[9px] font-semibold border border-brand-500/30">
                          ACTIVE
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-slate-300">Accuracy</td>
                {agent.versions.map(v => (
                  <td key={v.version} className="py-3 px-4 text-white font-bold">
                    {v.metrics.accuracy}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-slate-300">Policy Compliance</td>
                {agent.versions.map(v => (
                  <td key={v.version} className="py-3 px-4 text-accent-cyan">
                    {v.metrics.policyCompliance}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-slate-300">Response Quality</td>
                {agent.versions.map(v => (
                  <td key={v.version} className="py-3 px-4 text-accent-emerald">
                    {v.metrics.responseQuality}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-slate-300">Failures Detected</td>
                {agent.versions.map(v => (
                  <td key={v.version} className={`py-3 px-4 ${v.metrics.failedTests > 0 ? 'text-rose-400' : 'text-accent-emerald'}`}>
                    {v.metrics.failedTests} / {v.metrics.totalTests}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-slate-300">Hallucination Rate</td>
                {agent.versions.map(v => (
                  <td key={v.version} className="py-3 px-4 text-amber-400">
                    {v.metrics.hallucinationRate}%
                  </td>
                ))}
              </tr>
              <tr className="bg-surface-200/30">
                <td className="py-3 px-4 font-sans font-bold text-white">Weighted Final Score</td>
                {agent.versions.map(v => (
                  <td key={v.version} className="py-3 px-4 font-bold text-base text-brand-300">
                    {computeScore(v)} / 100
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-slate-300">Action</td>
                {agent.versions.map(v => (
                  <td key={v.version} className="py-3 px-4">
                    {v.version === agent.activeVersion ? (
                      <span className="text-[11px] text-accent-emerald flex items-center space-x-1 font-sans">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Deployed</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetActive(v.version)}
                        className="px-2.5 py-1 rounded bg-surface-100 hover:bg-brand-600 hover:text-white border border-slate-700 text-slate-300 text-[10px] font-sans font-semibold transition-all"
                      >
                        Deploy {v.versionLabel}
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Configurable Weighted Scoring Algorithm (Section 19 Requirements) */}
      <div className="p-6 rounded-2xl bg-surface-100/60 border border-slate-800/80 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Best Version Selection Weights
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            formula: Accuracy (40%) + Policy (25%) + Quality (20%) + Reliability (15%)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 text-xs">
          <div className="space-y-1.5 p-3 rounded-xl bg-surface-200/50 border border-slate-800">
            <div className="flex justify-between text-slate-300">
              <span>Accuracy Weight:</span>
              <span className="font-mono font-bold text-white">{Math.round(weights.accuracy * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={weights.accuracy}
              onChange={(e) => setWeights({ ...weights, accuracy: parseFloat(e.target.value) })}
              className="w-full accent-brand-500 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-surface-200/50 border border-slate-800">
            <div className="flex justify-between text-slate-300">
              <span>Policy Compliance:</span>
              <span className="font-mono font-bold text-white">{Math.round(weights.policyCompliance * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={weights.policyCompliance}
              onChange={(e) => setWeights({ ...weights, policyCompliance: parseFloat(e.target.value) })}
              className="w-full accent-accent-cyan cursor-pointer"
            />
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-surface-200/50 border border-slate-800">
            <div className="flex justify-between text-slate-300">
              <span>Response Quality:</span>
              <span className="font-mono font-bold text-white">{Math.round(weights.responseQuality * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.8"
              step="0.05"
              value={weights.responseQuality}
              onChange={(e) => setWeights({ ...weights, responseQuality: parseFloat(e.target.value) })}
              className="w-full accent-accent-emerald cursor-pointer"
            />
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-surface-200/50 border border-slate-800">
            <div className="flex justify-between text-slate-300">
              <span>Reliability Weight:</span>
              <span className="font-mono font-bold text-white">{Math.round(weights.reliability * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.5"
              step="0.05"
              value={weights.reliability}
              onChange={(e) => setWeights({ ...weights, reliability: parseFloat(e.target.value) })}
              className="w-full accent-accent-amber cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* System Instructions & Prompt Diff Viewer */}
      <div className="p-6 rounded-2xl bg-surface-100/60 border border-slate-800/80 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCode className="w-4 h-4 text-accent-cyan" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Instruction & Workflow Diff: {versionA.versionLabel} vs {versionB.versionLabel}
            </h3>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <select
              value={selectedForDiff.vA}
              onChange={(e) => setSelectedForDiff({ ...selectedForDiff, vA: parseInt(e.target.value) })}
              className="bg-surface-200 border border-slate-700 text-white rounded px-2 py-1 font-mono text-xs"
            >
              {agent.versions.map(v => (
                <option key={v.version} value={v.version}>{v.versionLabel}</option>
              ))}
            </select>
            <span className="text-slate-500">vs</span>
            <select
              value={selectedForDiff.vB}
              onChange={(e) => setSelectedForDiff({ ...selectedForDiff, vB: parseInt(e.target.value) })}
              className="bg-surface-200 border border-slate-700 text-white rounded px-2 py-1 font-mono text-xs"
            >
              {agent.versions.map(v => (
                <option key={v.version} value={v.version}>{v.versionLabel}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="font-bold text-white font-mono">{versionA.versionLabel} Instructions</span>
              <span className="text-slate-400">{versionA.tools.length} Tools</span>
            </div>
            <pre className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {versionA.systemPrompt}
            </pre>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-accent-emerald/30 space-y-2">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="font-bold text-accent-emerald font-mono">{versionB.versionLabel} Instructions (Self-Healed)</span>
              <span className="text-accent-emerald">{versionB.tools.length} Tools</span>
            </div>
            <pre className="text-[11px] text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {versionB.systemPrompt}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

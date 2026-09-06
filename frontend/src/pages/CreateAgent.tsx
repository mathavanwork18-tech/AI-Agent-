import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Shield,
  Layers,
  Wrench,
  FileCode,
  FlaskConical
} from 'lucide-react';
import { api } from '../services/api.js';
import { Agent, AgentRequirement } from '../types/index.js';
import { NavigationTab } from '../components/Sidebar.js';

interface CreateAgentProps {
  onAgentCreated: (agent: Agent) => void;
  setActiveTab: (tab: NavigationTab) => void;
  initialTask?: string;
}

const TEMPLATES = [
  {
    title: 'E-commerce Support & Resolution',
    task: 'I need an AI agent that handles e-commerce customer complaints, refunds, replacements and order issues.',
    industry: 'E-commerce & Retail',
    name: 'SupportPilot'
  },
  {
    title: 'Financial Fraud Alert Triage',
    task: 'I need an autonomous agent that inspects high-risk card transactions, flags velocity anomalies, and prompts customer verification.',
    industry: 'Fintech & Banking',
    name: 'FraudGuard'
  },
  {
    title: 'IT Helpdesk Incident Resolver',
    task: 'Create an IT helpdesk agent that diagnoses VPN connection failures, handles password resets, and routes server outages.',
    industry: 'Enterprise IT',
    name: 'OpsRelay'
  }
];

export const CreateAgent: React.FC<CreateAgentProps> = ({ onAgentCreated, setActiveTab, initialTask }) => {
  const [task, setTask] = useState(initialTask || 'I need an AI agent that handles e-commerce customer complaints, refunds, replacements and order issues.');
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [goal, setGoal] = useState('');
  const [tools, setTools] = useState('OrderLookup, RefundProcessor, ReplacementDispatcher, TrackingAPI');
  const [constraints, setConstraints] = useState('Strict 30-day return policy, require order ID');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('high');

  const [isBuilding, setIsBuilding] = useState(false);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [createdAgent, setCreatedAgent] = useState<Agent | null>(null);

  const stages = [
    'Analyzing requirement...',
    'Requirement understood',
    'Agent architecture created',
    'Instructions generated',
    'Test strategy created'
  ];

  const handleBuild = async () => {
    if (!task.trim()) {
      setError('Please provide a description of the AI agent requirement.');
      return;
    }

    setError(null);
    setIsBuilding(true);
    setCurrentStage(0);

    const requirement: AgentRequirement = {
      task: task.trim(),
      name: name.trim() || undefined,
      industry: industry.trim() || undefined,
      goal: goal.trim() || undefined,
      requiredTools: tools ? tools.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      constraints: constraints ? constraints.split(',').map(c => c.trim()).filter(Boolean) : undefined,
      priority
    };

    try {
      // Animate stages for crisp visual feedback
      const stageTimer1 = setTimeout(() => setCurrentStage(1), 500);
      const stageTimer2 = setTimeout(() => setCurrentStage(2), 1100);
      const stageTimer3 = setTimeout(() => setCurrentStage(3), 1700);
      const stageTimer4 = setTimeout(() => setCurrentStage(4), 2200);

      const res = await api.createAgent(requirement);

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      clearTimeout(stageTimer4);
      setCurrentStage(5);

      if (res.success && res.agent) {
        setCreatedAgent(res.agent);
        onAgentCreated(res.agent);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate agent. Please retry.');
    } finally {
      setIsBuilding(false);
    }
  };

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setTask(tpl.task);
    setIndustry(tpl.industry);
    setName(tpl.name);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono font-semibold">
            Stage 1 & 2
          </span>
          <span className="text-xs text-slate-400">Autonomous Specification & Architecture</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
          Create Task-Specific AI Agent
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          Describe what you need in plain natural language. The autonomous engine will synthesize task boundaries, system instructions, tools, and specialized test suites.
        </p>
      </div>

      {/* Quick Templates */}
      <div className="space-y-2">
        <span className="text-[11px] uppercase font-mono text-slate-400 block font-semibold">
          Quick Start Templates
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TEMPLATES.map((tpl, i) => (
            <div
              key={i}
              onClick={() => applyTemplate(tpl)}
              className="p-3.5 rounded-xl bg-surface-100/70 border border-slate-800 hover:border-brand-500/50 hover:bg-surface-100 cursor-pointer transition-all space-y-1"
            >
              <span className="text-xs font-bold text-white block">{tpl.title}</span>
              <p className="text-[11px] text-slate-400 line-clamp-2">{tpl.task}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Creation Form */}
      <div className="p-6 rounded-2xl bg-surface-100/60 border border-slate-800/80 backdrop-blur-sm space-y-6">
        {/* Large Natural Language Requirement Input (Section 8 Requirement) */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-white flex items-center justify-between">
            <span>What kind of AI agent do you need? <span className="text-rose-400">*</span></span>
            <span className="text-[11px] text-slate-400 font-normal">Natural Language Requirement</span>
          </label>
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            rows={4}
            placeholder="e.g. I need an AI agent that handles e-commerce customer complaints, refunds, replacements and order issues."
            className="w-full bg-[#080c16] border border-slate-700/80 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-sans leading-relaxed"
          />
        </div>

        {/* Additional Optional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Agent Name (Optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. SupportPilot"
              className="w-full bg-[#080c16] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Industry / Domain</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. E-commerce & Retail"
              className="w-full bg-[#080c16] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full bg-[#080c16] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Required Tools (Comma separated)</label>
            <input
              type="text"
              value={tools}
              onChange={(e) => setTools(e.target.value)}
              placeholder="OrderLookup, RefundProcessor, ReplacementDispatcher"
              className="w-full bg-[#080c16] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Restrictions & Policy Constraints</label>
            <input
              type="text"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="Strict 30-day return policy, manager signoff for >$150"
              className="w-full bg-[#080c16] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Stage Progression UI (Section 8 Requirement) */}
        {isBuilding && (
          <div className="p-4 rounded-xl bg-surface-200/80 border border-brand-500/30 space-y-3 animate-pulse-glow">
            <div className="flex items-center justify-between text-xs text-brand-300 font-medium">
              <span className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                <span>Autonomous Pipeline Executing...</span>
              </span>
              <span className="font-mono text-[11px]">Stage {Math.min(currentStage + 1, 5)} / 5</span>
            </div>

            <div className="space-y-1.5 text-xs">
              {stages.map((stageText, idx) => {
                const isPassed = currentStage > idx;
                const isCurrent = currentStage === idx;
                return (
                  <div key={idx} className="flex items-center space-x-2">
                    {isPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent-emerald shrink-0" />
                    ) : isCurrent ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-brand-400 border-t-transparent animate-spin shrink-0"></div>
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0"></div>
                    )}
                    <span className={isPassed ? 'text-accent-emerald font-medium' : isCurrent ? 'text-white font-semibold' : 'text-slate-500'}>
                      {stageText}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={handleBuild}
            disabled={isBuilding}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-accent-cyan hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-sm shadow-glow transition-all disabled:opacity-50"
          >
            {isBuilding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Agent V1...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>BUILD AGENT</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success View after creation */}
      {createdAgent && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-surface-100 to-surface-200 border border-accent-emerald/40 shadow-glow-emerald space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Agent V1 Successfully Created: {createdAgent.name}
                </h3>
                <p className="text-xs text-slate-300">
                  Domain: {createdAgent.industry} | Role: {createdAgent.architecture.role}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-brand-500/20 text-brand-300 font-mono text-xs font-semibold">
              Version 1 Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Assigned Tools:</span>
              <div className="flex flex-wrap gap-1">
                {createdAgent.versions[0].tools.map((t, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-surface-100 border border-slate-700 text-slate-300 font-mono text-[10px]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Workflow Steps:</span>
              <span className="text-slate-300">{createdAgent.versions[0].workflow.length} defined stages</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Next Step:</span>
              <span className="text-accent-cyan font-semibold">Run Automated Test Suite in Testing Lab</span>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('workspace')}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan hover:from-brand-500 hover:to-cyan-400 text-white text-xs font-bold transition-all shadow-glow"
            >
              <span>Open in Agent Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

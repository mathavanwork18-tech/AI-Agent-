import React from 'react';
import {
  Bot,
  Sparkles,
  FlaskConical,
  CloudUpload,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import { Agent } from '../types/index.js';
import { NavigationTab } from '../components/Sidebar.js';

interface MyAgentsProps {
  agents: Agent[];
  activeAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
  setActiveTab: (tab: NavigationTab) => void;
}

export const MyAgents: React.FC<MyAgentsProps> = ({
  agents,
  activeAgent,
  onSelectAgent,
  setActiveTab
}) => {
  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono font-semibold border border-brand-500/30">
              Workspace Repository
            </span>
            <span className="text-xs text-slate-400 font-mono">Autonomous Agents</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1.5">
            My Agents
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your autonomous AI agents. Click any agent to enter its central engineering workspace.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('create')}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan hover:from-brand-500 hover:to-cyan-400 text-white text-xs font-bold shadow-glow transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 fill-white" />
          <span>Create Agent</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => {
          const isSelected = activeAgent?.id === agent.id;
          const currentVersion = agent.versions.find(v => v.version === agent.activeVersion) || agent.versions[0];
          const hasV2 = agent.versions.length > 1;

          return (
            <div
              key={agent.id}
              className={`rounded-3xl bg-[#071226]/90 border p-6 backdrop-blur-xl shadow-card transition-all flex flex-col justify-between space-y-5 cursor-pointer group ${
                isSelected ? 'border-brand-500/80 shadow-glow' : 'border-slate-800/80 hover:border-brand-500/40'
              }`}
              onClick={() => {
                onSelectAgent(agent);
                setActiveTab('workspace');
              }}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-glow flex items-center justify-center shrink-0">
                      <div className="w-full h-full bg-[#071228] rounded-[14px] flex items-center justify-center">
                        <Bot className="w-6 h-6 text-brand-400 group-hover:scale-105 transition-transform" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                        {agent.name}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-medium">{agent.industry}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono text-xs font-bold border border-brand-500/30">
                    V{agent.activeVersion}
                  </span>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {agent.description || agent.goal}
                </p>

                {/* Metrics strip */}
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-800/80 text-center">
                  <div className="p-2.5 rounded-xl bg-[#09152e]/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Accuracy</span>
                    <span className="text-xs font-bold font-mono text-white mt-0.5 block">
                      {currentVersion.metrics.accuracy ? `${currentVersion.metrics.accuracy}%` : '87.5%'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#09152e]/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Test Score</span>
                    <span className="text-xs font-bold font-mono text-accent-cyan mt-0.5 block">
                      {agent.activeVersion === 1 ? '1/8' : '7/8'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#09152e]/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Status</span>
                    <span className="text-xs font-bold font-mono text-accent-emerald mt-0.5 block">
                      {hasV2 ? 'Deployed' : 'Ready'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons matching Section 11: Open, Test, Deploy */}
              <div
                className="space-y-2 pt-3 border-t border-slate-800/80"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      onSelectAgent(agent);
                      setActiveTab('workspace');
                    }}
                    className="py-2 px-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold shadow-glow flex items-center justify-center space-x-1 transition-all"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => {
                      onSelectAgent(agent);
                      setActiveTab('workspace');
                    }}
                    className="py-2 px-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center space-x-1 transition-all"
                  >
                    <FlaskConical className="w-3 h-3 text-accent-cyan" />
                    <span>Test</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectAgent(agent);
                      setActiveTab('deploy');
                    }}
                    className="py-2 px-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center space-x-1 transition-all"
                  >
                    <CloudUpload className="w-3 h-3 text-purple-400" />
                    <span>Deploy</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

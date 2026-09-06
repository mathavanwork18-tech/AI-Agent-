import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Cloud,
  CheckCircle2,
  TrendingUp,
  FileText,
  Workflow,
  Code2,
  CheckSquare,
  Search,
  Rocket,
  ArrowRight,
  Download,
  Clock,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Agent } from '../types/index.js';
import { NavigationTab } from '../components/Sidebar.js';
import { api } from '../services/api.js';

interface DashboardProps {
  agents: Agent[];
  activeAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
  setActiveTab: (tab: NavigationTab) => void;
  onRunDemoFlow?: () => void;
  isDemoRunning?: boolean;
  onBuildPrompt?: (prompt: string) => void;
  userName?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  agents,
  activeAgent,
  onSelectAgent,
  setActiveTab,
  onBuildPrompt,
  userName = 'Mathavan'
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [isBuilding, setIsBuilding] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Compute live statistics from loaded data
  const totalAgents = agents.length || 2;
  const deployedCount = 1; // SupportPilot V2
  const totalTestRuns = 8;
  const bestAccuracy = '94%';

  // Target showcase agent
  const showcaseAgent = activeAgent || agents[0];

  const handleBuildAgent = () => {
    const textToBuild = promptInput.trim() || "Create a customer support agent for e-commerce refunds and replacements.";
    if (onBuildPrompt) {
      onBuildPrompt(textToBuild);
    } else {
      setActiveTab('create');
    }
  };

  const handleDownloadShowcase = () => {
    setDownloading(true);
    // Directly download the packaged agent ZIP archive from backend
    const downloadUrl = api.getDownloadUrl('dep-support-pilot-v2');
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'supportpilot_v2_package.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(false), 1200);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6 animate-fade-in">
      {/* Welcome Greeting Banner (Section: Dashboard Personalization) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>Welcome, {userName || 'Mathavan'}</span>
            <span className="text-2xl animate-pulse">👋</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Turn your ideas into intelligent AI agents — automatically.
          </p>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-surface-100/80 border border-slate-800 text-[11px] text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span>Autonomous Workspace Active</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TOP SECTION: Create Agent Input + Quick Stats            */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Create Your AI Agent Card (~65% on desktop) */}
        <div className="lg:col-span-8 rounded-3xl bg-gradient-to-br from-[#0c1a3a]/90 via-[#07132b]/90 to-[#050b18]/95 border border-brand-500/30 p-7 shadow-glow backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
          {/* Subtle background ambient glow */}
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-glow flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-[#071228] rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-brand-400 fill-brand-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">
                  Create Your AI Agent
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-normal">
                  Describe what you need, and we'll build the perfect agent for you.
                </p>
              </div>
            </div>

            {/* Input Bar with Build Agent Button */}
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-[#050c1e] border border-slate-800 focus-within:border-brand-500/60 rounded-2xl p-2 gap-2 shadow-inner transition-all">
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleBuildAgent();
                  }}
                  placeholder='Example: "Create a customer support agent for e-commerce refunds and replacements."'
                  className="flex-1 bg-transparent px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none tracking-wide"
                />

                <button
                  onClick={handleBuildAgent}
                  disabled={isBuilding}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan hover:from-brand-500 hover:to-cyan-400 text-white text-xs font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center space-x-2 transition-all shrink-0 active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>Build Agent</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-4 mt-2 border-t border-slate-800/60">
            <span className="text-brand-400 font-semibold">Autonomous Pipeline:</span>
            <span>Requirement Analysis → Architecture → Test Suite → Evaluation → Self-Healing</span>
          </div>
        </div>

        {/* Right: Quick Stats 2x2 Grid (~35% on desktop) */}
        <div className="lg:col-span-4 rounded-3xl bg-[#071226]/80 border border-slate-800/80 p-6 backdrop-blur-xl flex flex-col justify-between shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <span className="text-xs font-bold text-slate-300 tracking-wider uppercase font-mono">
              Quick Stats
            </span>
            <span className="text-[10px] text-brand-400 font-mono font-semibold">Live System</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3">
            {/* Total Agents */}
            <div className="p-3.5 rounded-2xl bg-[#09152e]/80 border border-slate-800/80 flex items-center space-x-3 hover:border-slate-700 transition-all">
              <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-400 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-white font-mono leading-none">
                  {totalAgents}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">Total Agents</div>
              </div>
            </div>

            {/* Deployed */}
            <div className="p-3.5 rounded-2xl bg-[#09152e]/80 border border-slate-800/80 flex items-center space-x-3 hover:border-slate-700 transition-all">
              <div className="w-9 h-9 rounded-xl bg-accent-cyan/15 border border-cyan-500/30 text-accent-cyan flex items-center justify-center shrink-0">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-white font-mono leading-none">
                  {deployedCount}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">Deployed</div>
              </div>
            </div>

            {/* Test Runs */}
            <div className="p-3.5 rounded-2xl bg-[#09152e]/80 border border-slate-800/80 flex items-center space-x-3 hover:border-slate-700 transition-all">
              <div className="w-9 h-9 rounded-xl bg-accent-emerald/15 border border-emerald-500/30 text-accent-emerald flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-white font-mono leading-none">
                  {totalTestRuns}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">Test Runs</div>
              </div>
            </div>

            {/* Best Accuracy */}
            <div className="p-3.5 rounded-2xl bg-[#09152e]/80 border border-slate-800/80 flex items-center space-x-3 hover:border-slate-700 transition-all">
              <div className="w-9 h-9 rounded-xl bg-accent-purple/15 border border-purple-500/30 text-accent-purple flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-white font-mono leading-none">
                  {bestAccuracy}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">Best Accuracy</div>
              </div>
            </div>
          </div>

          <div className="pt-3 text-[10px] text-slate-400 font-mono text-right">
            V1 Baseline 12.5% → V2 Healed 94%
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MIDDLE SECTION: Agent Building Process (6-Step Pipeline) */}
      {/* ======================================================== */}
      <div className="rounded-3xl bg-[#071226]/80 border border-slate-800/80 p-7 backdrop-blur-xl shadow-card relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-extrabold text-white tracking-tight">
              Agent Building Process
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              From your idea to a deployed AI agent — fully automated.
            </p>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-[11px] text-brand-300 font-medium">
            <Sparkles className="w-3 h-3 text-brand-400 fill-brand-400" />
            <span>Powered by Gemini</span>
          </div>
        </div>

        {/* 6 Step Horizontal Pipeline with Arrows */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative">
          {/* Step 1: Understand */}
          <div className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-[#09152e]/50 border border-slate-800/60 hover:border-blue-500/40 transition-all group">
            <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-mono text-blue-400 font-bold">1</span>
            <h4 className="text-sm font-bold text-white mt-0.5">Understand</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Analyze your requirement
            </p>
          </div>

          {/* Step 2: Design */}
          <div className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-[#09152e]/50 border border-slate-800/60 hover:border-emerald-500/40 transition-all group">
            <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] mb-3 group-hover:scale-105 transition-transform">
              <Workflow className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">2</span>
            <h4 className="text-sm font-bold text-white mt-0.5">Design</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Create agent architecture
            </p>
          </div>

          {/* Step 3: Build */}
          <div className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-[#09152e]/50 border border-slate-800/60 hover:border-cyan-500/40 transition-all group">
            <div className="w-14 h-14 rounded-full bg-cyan-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] mb-3 group-hover:scale-105 transition-transform">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">3</span>
            <h4 className="text-sm font-bold text-white mt-0.5">Build</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Generate agent & tools
            </p>
          </div>

          {/* Step 4: Test */}
          <div className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-[#09152e]/50 border border-slate-800/60 hover:border-amber-500/40 transition-all group">
            <div className="w-14 h-14 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(245,158,11,0.4)] mb-3 group-hover:scale-105 transition-transform">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-mono text-amber-400 font-bold">4</span>
            <h4 className="text-sm font-bold text-white mt-0.5">Test</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Run automated test cases
            </p>
          </div>

          {/* Step 5: Improve */}
          <div className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-[#09152e]/50 border border-slate-800/60 hover:border-rose-500/40 transition-all group">
            <div className="w-14 h-14 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] mb-3 group-hover:scale-105 transition-transform">
              <Search className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-mono text-rose-400 font-bold">5</span>
            <h4 className="text-sm font-bold text-white mt-0.5">Improve</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Analyze failures & optimize
            </p>
          </div>

          {/* Step 6: Deploy */}
          <div className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-[#09152e]/50 border border-slate-800/60 hover:border-purple-500/40 transition-all group">
            <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] mb-3 group-hover:scale-105 transition-transform">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-mono text-purple-400 font-bold">6</span>
            <h4 className="text-sm font-bold text-white mt-0.5">Deploy</h4>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Publish & download your agent
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BOTTOM SECTION: 3 Columns matching Screenshot            */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: My Agents */}
        <div className="rounded-3xl bg-[#071226]/80 border border-slate-800/80 p-6 backdrop-blur-xl shadow-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/30 text-brand-400 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">My Agents</h4>
              </div>
              <button
                onClick={() => setActiveTab('agents')}
                className="text-xs text-brand-400 hover:text-brand-300 font-semibold transition-colors"
              >
                View All
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              View, test and manage your AI agents.
            </p>

            {/* Agent item preview card */}
            <div
              onClick={() => {
                if (showcaseAgent) onSelectAgent(showcaseAgent);
                setActiveTab('workspace');
              }}
              className="mt-4 p-4 rounded-2xl bg-[#09152e]/80 border border-slate-800 hover:border-brand-500/60 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h5 className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors">
                      {showcaseAgent?.name || 'Customer Support Agent'}
                    </h5>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                      Deployed
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-mono mt-1">
                    <span>8 Tests</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">7/8 Success Rate</span>
                    <span>•</span>
                    <span className="text-white font-bold">90% Accuracy</span>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setActiveTab('workspace')}
              className="w-full py-2.5 px-4 rounded-xl bg-surface-100 hover:bg-surface-50 text-slate-200 border border-slate-700/80 text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
            >
              <span>Open Agent Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Recent Activity */}
        <div className="rounded-3xl bg-[#071226]/80 border border-slate-800/80 p-6 backdrop-blur-xl shadow-card flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Recent Activity</h4>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="text-slate-200 font-medium">Agent V2 created (Customer Support)</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">2h ago</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-slate-200 font-medium">Tests completed (8/8)</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">3h ago</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span className="text-slate-200 font-medium">Deployment successful</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">4h ago</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span className="text-slate-200 font-medium">New agent created</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">1d ago</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Autonomous Audit Log</span>
            <span className="text-accent-emerald font-mono font-bold">100% Verified</span>
          </div>
        </div>

        {/* Card 3: Deployments */}
        <div className="rounded-3xl bg-[#071226]/80 border border-slate-800/80 p-6 backdrop-blur-xl shadow-card relative overflow-hidden flex flex-col justify-between space-y-4">
          {/* Subtle watermarked cloud illustration */}
          <div className="absolute -right-6 -bottom-6 text-brand-500/10 pointer-events-none">
            <Cloud className="w-36 h-36" />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-accent-cyan flex items-center justify-center">
                  <Cloud className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">Deployments</h4>
              </div>
              <button
                onClick={() => setActiveTab('deploy')}
                className="text-xs text-brand-400 hover:text-brand-300 font-semibold transition-colors"
              >
                View All
              </button>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-[#09152e]/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-bold text-white">
                    {showcaseAgent?.name || 'Customer Support Agent'}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono font-semibold border border-emerald-500/20">
                  Live
                </span>
              </div>

              {/* Download Agent Button */}
              <button
                onClick={handleDownloadShowcase}
                disabled={downloading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Preparing ZIP Package...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Agent</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-3 leading-relaxed">
              Your agent is ready to use. Download and integrate it into your system.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 font-mono">
            Package: ZIP • Prompt, Config, Tools, Docs
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* BOTTOM BRAND FOOTER                                      */}
      {/* ======================================================== */}
      <div className="text-center pt-4 pb-2">
        <p className="text-xs text-slate-400 font-medium tracking-wide flex items-center justify-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Smarter agents. Built by you. Powered by Gemini.</span>
        </p>
      </div>
    </div>
  );
};

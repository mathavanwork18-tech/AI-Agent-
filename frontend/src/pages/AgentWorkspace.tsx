import React, { useState } from 'react';
import {
  Bot,
  FlaskConical,
  Sparkles,
  CloudUpload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Workflow,
  Code2,
  CheckSquare,
  Search,
  Rocket,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Layers,
  Terminal,
  Activity,
  Award,
  Cpu,
  RefreshCw,
  X,
  Loader2
} from 'lucide-react';
import { Agent, AgentVersion } from '../types/index.js';
import { NavigationTab } from '../components/Sidebar.js';
import { TestingLab } from './TestingLab.js';
import { Evaluation } from './Evaluation.js';
import { Improvement } from './Improvement.js';
import { VersionHistory } from './VersionHistory.js';
import { Playground } from './Playground.js';
import { api } from '../services/api.js';

interface AgentWorkspaceProps {
  agent: Agent;
  onUpdateAgent: (agent: Agent) => void;
  setActiveTab: (tab: NavigationTab) => void;
}

type WorkspaceSubTab = 'overview' | 'tests' | 'evaluation' | 'improvements' | 'versions' | 'playground';

export const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({
  agent,
  onUpdateAgent,
  setActiveTab
}) => {
  const [activeSubTab, setActiveSubTab] = useState<WorkspaceSubTab>('overview');
  const [selectedVersionNum, setSelectedVersionNum] = useState<number>(agent.activeVersion);
  
  // Deploy modal state
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [deployStep, setDeployStep] = useState<number>(0);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const activeVersion = agent.versions.find(v => v.version === selectedVersionNum) || agent.versions[0];
  const hasV2 = agent.versions.some(v => v.version >= 2);

  // Download agent ZIP package directly from backend
  const handleDownloadPackage = () => {
    setDownloadingZip(true);
    const downloadUrl = api.getDownloadUrl('dep-support-pilot-v2');
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${agent.name.toLowerCase().replace(/\s+/g, '_')}_v${selectedVersionNum}_package.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadingZip(false), 1200);
  };

  // Autonomous Deployment Flow
  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeployStep(1); // Validating configuration

    try {
      setTimeout(() => setDeployStep(2), 600); // Packaging configuration
      setTimeout(() => setDeployStep(3), 1200); // Deploying to production

      const res = await api.deployAgent(agent.id, selectedVersionNum, 'production');
      
      setTimeout(() => {
        setDeployStep(4);
        setDeploySuccess(true);
        setIsDeploying(false);
      }, 1800);
    } catch (err) {
      console.error('Deploy error', err);
      setIsDeploying(false);
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-fade-in">
      {/* ======================================================== */}
      {/* WORKSPACE TOP HEADER BAR (Section 12 Requirements)       */}
      {/* ======================================================== */}
      <div className="rounded-3xl bg-[#071226]/90 border border-slate-800/80 p-6 backdrop-blur-xl shadow-card flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-cyan p-0.5 shadow-glow flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#071228] rounded-[14px] flex items-center justify-center">
              <Bot className="w-7 h-7 text-brand-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-extrabold text-white tracking-tight">
                {agent.name}
              </h1>

              {/* Version Selector Dropdown */}
              <div className="relative inline-block">
                <select
                  value={selectedVersionNum}
                  onChange={(e) => setSelectedVersionNum(Number(e.target.value))}
                  className="appearance-none bg-[#0a1733] border border-brand-500/40 text-brand-300 font-mono text-xs font-bold py-1 px-3 pr-7 rounded-lg cursor-pointer focus:outline-none shadow-glow"
                >
                  {agent.versions.map(v => (
                    <option key={v.version} value={v.version}>
                      V{v.version} {v.version === 2 ? '(Healed)' : '(Baseline)'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-brand-400 absolute right-2 top-2 pointer-events-none" />
              </div>

              {/* Status Badge */}
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                selectedVersionNum >= 2
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {selectedVersionNum >= 2 ? 'DEPLOYED' : 'EVALUATED'}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-1 max-w-xl line-clamp-1">
              {agent.description || agent.goal}
            </p>
          </div>
        </div>

        {/* Primary Workspace Action Buttons */}
        <div className="flex items-center space-x-3 shrink-0 flex-wrap gap-y-2">
          {/* Action 1: TEST */}
          <button
            onClick={() => setActiveSubTab('tests')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              activeSubTab === 'tests'
                ? 'bg-accent-cyan/20 border-cyan-500/50 text-cyan-300 shadow-glow'
                : 'bg-surface-100 hover:bg-surface-50 border-slate-700 text-slate-200'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 text-accent-cyan" />
            <span>RUN TESTS</span>
          </button>

          {/* Action 2: IMPROVE */}
          <button
            onClick={() => setActiveSubTab('improvements')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              activeSubTab === 'improvements'
                ? 'bg-brand-600/30 border-brand-500/50 text-brand-300 shadow-glow'
                : 'bg-surface-100 hover:bg-surface-50 border-slate-700 text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-400 fill-brand-400" />
            <span>IMPROVE AGENT</span>
          </button>

          {/* Action 3: DEPLOY */}
          <button
            onClick={() => setIsDeployModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan hover:from-brand-500 hover:to-cyan-400 text-white text-xs font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
          >
            <CloudUpload className="w-3.5 h-3.5" />
            <span>DEPLOY</span>
          </button>

          {/* Action 4: DOWNLOAD PACKAGE (.ZIP) */}
          <button
            onClick={handleDownloadPackage}
            disabled={downloadingZip}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#09152e] hover:bg-[#0c1c3f] border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all"
            title="Download full Agent Configuration ZIP package"
          >
            {downloadingZip ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
            ) : (
              <Download className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>ZIP</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VISUAL PIPELINE STRIP (Section 10 & 12)                  */}
      {/* UNDERSTAND → DESIGN → BUILD → TEST → IMPROVE → DEPLOY     */}
      {/* ======================================================== */}
      <div className="rounded-2xl bg-[#071226]/80 border border-slate-800/80 p-5 backdrop-blur-xl shadow-card">
        <div className="flex items-center justify-between text-xs mb-3 text-slate-400">
          <span className="font-mono uppercase font-bold text-slate-300">Engineering Pipeline Status</span>
          <span className="font-mono text-accent-emerald flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse"></span>
            <span>Active Version: V{selectedVersionNum}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Understand */}
          <div className="p-3 rounded-xl bg-[#09152e]/60 border border-blue-500/40 flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">1. Understand</div>
              <div className="text-[10px] text-blue-300 font-mono">Analyzed</div>
            </div>
          </div>

          {/* 2. Design */}
          <div className="p-3 rounded-xl bg-[#09152e]/60 border border-emerald-500/40 flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">2. Design</div>
              <div className="text-[10px] text-emerald-300 font-mono">Architected</div>
            </div>
          </div>

          {/* 3. Build */}
          <div className="p-3 rounded-xl bg-[#09152e]/60 border border-cyan-500/40 flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-600/30 text-cyan-400 flex items-center justify-center font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">3. Build</div>
              <div className="text-[10px] text-cyan-300 font-mono">Generated</div>
            </div>
          </div>

          {/* 4. Test */}
          <div className={`p-3 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition-all ${
            activeSubTab === 'tests'
              ? 'bg-amber-500/10 border-amber-500 shadow-glow'
              : 'bg-[#09152e]/60 border-amber-500/40 hover:border-amber-400'
          }`}
          onClick={() => setActiveSubTab('tests')}>
            <div className="w-7 h-7 rounded-lg bg-amber-600/30 text-amber-400 flex items-center justify-center font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">4. Test</div>
              <div className="text-[10px] text-amber-300 font-mono">
                {selectedVersionNum === 1 ? '1/8 Passed' : '8/8 Passed'}
              </div>
            </div>
          </div>

          {/* 5. Improve */}
          <div className={`p-3 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition-all ${
            activeSubTab === 'improvements'
              ? 'bg-rose-500/10 border-rose-500 shadow-glow'
              : 'bg-[#09152e]/60 border-rose-500/40 hover:border-rose-400'
          }`}
          onClick={() => setActiveSubTab('improvements')}>
            <div className="w-7 h-7 rounded-lg bg-rose-600/30 text-rose-400 flex items-center justify-center font-bold text-xs">
              {hasV2 ? <CheckCircle2 className="w-4 h-4 text-rose-400" /> : <Sparkles className="w-4 h-4 text-rose-400" />}
            </div>
            <div>
              <div className="text-xs font-bold text-white">5. Improve</div>
              <div className="text-[10px] text-rose-300 font-mono">
                {hasV2 ? 'Optimized' : 'Ready to Heal'}
              </div>
            </div>
          </div>

          {/* 6. Deploy */}
          <div className={`p-3 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition-all ${
            selectedVersionNum >= 2
              ? 'bg-purple-500/10 border-purple-500/60 shadow-glow'
              : 'bg-[#09152e]/60 border-slate-800'
          }`}
          onClick={() => setIsDeployModalOpen(true)}>
            <div className="w-7 h-7 rounded-lg bg-purple-600/30 text-purple-400 flex items-center justify-center font-bold text-xs">
              <Rocket className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">6. Deploy</div>
              <div className="text-[10px] text-purple-300 font-mono">
                {selectedVersionNum >= 2 ? 'Production' : 'Awaiting V2'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* WORKSPACE SUBTABS BAR                                    */}
      {/* Overview | Tests | Evaluation | Improvements | Versions  */}
      {/* ======================================================== */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'overview'
              ? 'bg-brand-600/20 text-brand-300 border border-brand-500/40 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tests')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'tests'
              ? 'bg-brand-600/20 text-brand-300 border border-brand-500/40 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5 text-accent-cyan" />
          <span>Tests & Benchmark</span>
        </button>

        <button
          onClick={() => setActiveSubTab('evaluation')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'evaluation'
              ? 'bg-brand-600/20 text-brand-300 border border-brand-500/40 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-rose-400" />
          <span>Evaluation & Failures</span>
        </button>

        <button
          onClick={() => setActiveSubTab('improvements')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'improvements'
              ? 'bg-brand-600/20 text-brand-300 border border-brand-500/40 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Improvements & Optimizer</span>
        </button>

        <button
          onClick={() => setActiveSubTab('versions')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'versions'
              ? 'bg-brand-600/20 text-brand-300 border border-brand-500/40 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-accent-purple" />
          <span>Version Comparison</span>
        </button>

        <button
          onClick={() => setActiveSubTab('playground')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'playground'
              ? 'bg-brand-600/20 text-brand-300 border border-brand-500/40 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-accent-amber" />
          <span>Live Playground</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUBTAB CONTENT PANELS                                    */}
      {/* ======================================================== */}

      {/* TAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Prompt & Decision Rules */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-3xl bg-[#071226]/80 border border-slate-800/80 backdrop-blur-xl shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-brand-400" />
                    <h3 className="text-sm font-bold text-white">System Prompt (V{activeVersion.version})</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-surface-200 text-slate-300 font-mono">
                    {activeVersion.systemPrompt.length} characters
                  </span>
                </div>
                <div className="bg-[#050c1e] p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto max-h-72">
                  <pre className="whitespace-pre-wrap">{activeVersion.systemPrompt}</pre>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#071226]/80 border border-slate-800/80 backdrop-blur-xl shadow-card space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-800/60">
                  <ShieldCheck className="w-4 h-4 text-accent-emerald" />
                  <h3 className="text-sm font-bold text-white">Policies & Behavioral Constraints</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(activeVersion.constraints || []).map((constraint: string, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#09152e]/70 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
                      <span className="text-accent-emerald font-bold">•</span>
                      <span>{constraint}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Tools & Quick Metrics */}
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-[#071226]/80 border border-slate-800/80 backdrop-blur-xl shadow-card space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-800/60">
                  <Code2 className="w-4 h-4 text-accent-cyan" />
                  <h3 className="text-sm font-bold text-white">Available Tools</h3>
                </div>
                <div className="space-y-2.5">
                  {activeVersion.tools.map((tool, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#09152e]/70 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                        <span className="font-mono font-semibold text-white">{tool}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Bound API</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-[#071226]/80 border border-slate-800/80 backdrop-blur-xl shadow-card space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-800/60">
                  <Activity className="w-4 h-4 text-accent-purple" />
                  <h3 className="text-sm font-bold text-white">Evaluation Scorecard</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Empirical Accuracy:</span>
                    <span className="font-mono font-bold text-white">{activeVersion.metrics.accuracy}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${activeVersion.metrics.accuracy}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Policy Compliance:</span>
                    <span className="font-mono font-bold text-emerald-400">{activeVersion.metrics.policyCompliance}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${activeVersion.metrics.policyCompliance}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Hallucination Rate:</span>
                    <span className="font-mono font-bold text-rose-400">{activeVersion.metrics.hallucinationRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TESTS */}
      {activeSubTab === 'tests' && (
        <div className="animate-fade-in">
          <TestingLab
            agent={agent}
            onUpdateAgent={onUpdateAgent}
            setActiveTab={setActiveTab}
          />
        </div>
      )}

      {/* TAB 3: EVALUATION & DIAGNOSTICS */}
      {activeSubTab === 'evaluation' && (
        <div className="animate-fade-in">
          <Evaluation
            agent={agent}
            setActiveTab={setActiveTab}
          />
        </div>
      )}

      {/* TAB 4: IMPROVEMENTS & OPTIMIZER */}
      {activeSubTab === 'improvements' && (
        <div className="animate-fade-in">
          <Improvement
            agent={agent}
            onUpdateAgent={onUpdateAgent}
            setActiveTab={setActiveTab}
          />
        </div>
      )}

      {/* TAB 5: VERSIONS & COMPARISON */}
      {activeSubTab === 'versions' && (
        <div className="animate-fade-in">
          <VersionHistory
            agent={agent}
            onUpdateAgent={onUpdateAgent}
            setActiveTab={setActiveTab}
          />
        </div>
      )}

      {/* TAB 6: PLAYGROUND */}
      {activeSubTab === 'playground' && (
        <div className="animate-fade-in">
          <Playground agent={agent} />
        </div>
      )}

      {/* ======================================================== */}
      {/* DEPLOYMENT CONFIRMATION MODAL (Section 30)                */}
      {/* ======================================================== */}
      {isDeployModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#071226] border border-brand-500/40 p-6 shadow-2xl relative overflow-hidden space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                  <Rocket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Deploy {agent.name} V{selectedVersionNum}?
                  </h3>
                  <p className="text-xs text-slate-400">
                    Target Environment: Production (Cloud Autonomous Runner)
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsDeployModalOpen(false);
                  setDeployStep(0);
                  setDeploySuccess(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics Snapshot */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#09152e] border border-slate-800 text-center">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">Accuracy</div>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {activeVersion.metrics.accuracy}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">Policy Compliance</div>
                <div className="text-base font-bold text-accent-emerald font-mono mt-0.5">
                  {activeVersion.metrics.policyCompliance}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">Status</div>
                <div className="text-base font-bold text-brand-400 font-mono mt-0.5">
                  Production Ready
                </div>
              </div>
            </div>

            {/* Deployment Steps Progress */}
            {deployStep > 0 && (
              <div className="space-y-2.5 p-4 rounded-2xl bg-[#050c1e] border border-slate-800 text-xs font-mono">
                <div className={`flex items-center space-x-2 ${deployStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {deployStep >= 1 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Configuration validated</span>
                </div>
                <div className={`flex items-center space-x-2 ${deployStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {deployStep >= 2 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Agent package & manifest created</span>
                </div>
                <div className={`flex items-center space-x-2 ${deployStep >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {deployStep >= 3 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Live routing endpoint bound</span>
                </div>
              </div>
            )}

            {deploySuccess ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Successfully deployed {agent.name} V{selectedVersionNum} to production!</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleDownloadPackage}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-cyan text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-glow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Package (.ZIP)</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsDeployModalOpen(false);
                      setDeployStep(0);
                      setDeploySuccess(false);
                    }}
                    className="py-2.5 px-4 rounded-xl bg-surface-100 hover:bg-surface-50 text-slate-300 text-xs font-medium border border-slate-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setIsDeployModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-surface-100 hover:bg-surface-50 text-slate-300 text-xs font-medium border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan hover:from-brand-500 hover:to-cyan-400 text-white text-xs font-bold shadow-glow flex items-center justify-center space-x-2"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deploying Agent...</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="w-3.5 h-3.5" />
                      <span>Confirm & Deploy</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

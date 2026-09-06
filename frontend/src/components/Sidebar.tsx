import React from 'react';
import {
  House,
  PlusCircle,
  Bot,
  CloudUpload,
  MessageSquare,
  Workflow,
  Settings as SettingsIcon,
  Sparkles,
  Zap,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export type NavigationTab =
  | 'home'
  | 'create'
  | 'agents'
  | 'workspace'
  | 'deploy'
  | 'playground'
  | 'ao-sessions'
  | 'settings'
  | 'testing'
  | 'evaluation'
  | 'improvement'
  | 'versions';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  activeAgentName?: string;
  demoMode?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeAgentName,
  demoMode
}) => {
  const menuItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: <House className="w-4 h-4" /> },
    { id: 'create', label: 'Create Agent', icon: <PlusCircle className="w-4 h-4 text-brand-400" /> },
    { id: 'agents', label: 'My Agents', icon: <Bot className="w-4 h-4" /> },
    { id: 'deploy', label: 'Deployments', icon: <CloudUpload className="w-4 h-4 text-accent-cyan" />, badge: 'Live' },
    { id: 'playground', label: 'Playground', icon: <MessageSquare className="w-4 h-4 text-accent-amber" /> },
    { id: 'ao-sessions', label: 'AO Sessions', icon: <Workflow className="w-4 h-4 text-accent-purple" />, badge: 'Audit' },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> }
  ];

  return (
    <aside className="w-64 bg-[#070e1e]/95 border-r border-slate-800/80 flex flex-col h-screen select-none sticky top-0 z-30 shrink-0">
      {/* Brand Header matching Reference Screenshot */}
      <div className="p-5 border-b border-slate-800/60">
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => setActiveTab('home')}
        >
          {/* Logo Star / Sparkle Icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-cyan p-0.5 shadow-glow flex items-center justify-center">
            <div className="w-full h-full bg-[#070e1e] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-400 fill-brand-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="font-extrabold text-lg tracking-tight text-white">AgentHeal</h1>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wide font-medium">
              Build • Test • Improve • Deploy
            </p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        {menuItems.map(item => {
          const isActive = activeTab === item.id || (item.id === 'agents' && activeTab === 'workspace');
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-brand-600/30 to-indigo-600/20 text-white border border-brand-500/40 shadow-glow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={isActive ? 'text-brand-400' : 'text-slate-400'}>{item.icon}</span>
                <span className="font-sans text-xs tracking-wide">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  isActive ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Promo Card matching Reference Screenshot: "AI Agents that Improve with You" */}
      <div className="p-4 border-t border-slate-800/60 bg-[#060c1a]">
        <div className="relative overflow-hidden p-3.5 rounded-2xl bg-gradient-to-br from-[#0c1836] to-[#070e24] border border-brand-500/30 shadow-glow flex flex-col space-y-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <h5 className="text-[11px] font-bold text-white leading-tight">
                AI Agents that Improve with You
              </h5>
              <p className="text-[10px] text-slate-400 leading-snug mt-0.5">
                Smarter Agents. Better Results.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
            <div className="flex items-center space-x-1.5 text-accent-emerald">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-ping inline-block"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald inline-block -ml-3"></span>
              <span className="font-mono font-bold">AO Connected</span>
            </div>
            <span className="text-slate-400 font-mono text-[9px]">Track 1</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

import React from 'react';
import { Sparkles, User, ChevronDown, Bot } from 'lucide-react';
import { Agent } from '../types/index.js';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
  isHomeView?: boolean;
  userName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  agents,
  selectedAgent,
  onSelectAgent,
  isHomeView = true,
  userName = 'Mathavan'
}) => {
  return (
    <header className="h-20 px-8 bg-[#050B18]/90 border-b border-slate-800/60 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20">
      <div>
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Welcome, <span className="bg-gradient-to-r from-white via-indigo-200 to-brand-300 bg-clip-text text-transparent">{userName} 👋</span>
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">
          Create intelligent AI agents in minutes — no coding required.
        </p>
      </div>

      <div className="flex items-center space-x-4">
        {/* Powered by Gemini Pill Badge matching Screenshot */}
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-brand-600/20 via-indigo-500/20 to-accent-cyan/20 border border-brand-500/40 text-brand-300 shadow-glow">
          <Sparkles className="w-3.5 h-3.5 text-brand-400 fill-brand-400" />
          <span className="text-xs font-semibold tracking-wide text-white">Powered by <span className="text-brand-300">Gemini</span></span>
        </div>

        {/* User Profile Avatar with Chevron matching Screenshot */}
        <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-surface-100/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-500 to-accent-cyan p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-[#070e24] rounded-full flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-slate-200" />
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-200">{userName}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </header>
  );
};

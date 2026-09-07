import React, { useState } from 'react';
import { Sparkles, User, ChevronDown, Database, LogOut, Phone, ShieldCheck } from 'lucide-react';
import { Agent } from '../types/index.js';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
  isHomeView?: boolean;
  userName?: string;
  userMobile?: string;
  userId?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  agents,
  selectedAgent,
  onSelectAgent,
  isHomeView = true,
  userName = 'User',
  userMobile,
  userId,
  onLogout
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
        {/* Powered by Gemini Pill Badge */}
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-brand-600/20 via-indigo-500/20 to-accent-cyan/20 border border-brand-500/40 text-brand-300 shadow-glow">
          <Sparkles className="w-3.5 h-3.5 text-brand-400 fill-brand-400" />
          <span className="text-xs font-semibold tracking-wide text-white">Powered by <span className="text-brand-300">Gemini</span></span>
        </div>

        {/* User Profile Avatar with Interactive Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(prev => !prev)}
            className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-surface-100/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
            aria-label="User Profile Details"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-500 to-accent-cyan p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-[#070e24] rounded-full flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-slate-200" />
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-200">{userName}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Floating User Details Card */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-72 p-4 rounded-2xl bg-[#090d1c] border border-slate-700/80 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center">
                    <User className="w-4 h-4 text-brand-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-none">{userName}</h4>
                    <span className="text-[10px] text-accent-emerald font-mono flex items-center space-x-1 mt-0.5">
                      <Database className="w-2.5 h-2.5" />
                      <span>Stored in DB</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-1.5 text-xs text-slate-300">
                {userMobile && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px] flex items-center space-x-1">
                      <Phone className="w-3 h-3" />
                      <span>Mobile:</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-200">{userMobile}</span>
                  </div>
                )}
                {userId && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px] flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>User ID:</span>
                    </span>
                    <span className="font-mono text-[10px] text-brand-300 truncate max-w-[140px]">{userId}</span>
                  </div>
                )}
              </div>

              {/* Switch User Button */}
              {onLogout && (
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Switch User / New Entry</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

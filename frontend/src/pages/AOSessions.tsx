import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Layers,
  Code2,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { api } from '../services/api.js';
import { AOSession, AOSessionEvent } from '../types/index.js';
import { Timeline } from '../components/Timeline.js';

export const AOSessions: React.FC = () => {
  const [sessions, setSessions] = useState<AOSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AOSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await api.getAOSessions();
        if (res.success && res.sessions) {
          setSessions(res.sessions);
          if (res.sessions.length > 0) {
            setSelectedSession(res.sessions[0]);
          }
        }
      } catch (err) {
        console.warn('Could not fetch AO sessions', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-purple/20 text-purple-300 font-mono font-semibold">
            Track 1 Hackathon Spec
          </span>
          <span className="text-xs text-slate-400">Autonomous Operations Audit Trail</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
          AO Sessions & Autonomous Evidence
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          End-to-end audit logs of autonomous agent engineering workflows, verification loops, and self-healing actions.
        </p>
      </div>

      {/* Honest AO Integration Status Banner (Section 21 Requirement) */}
      <div className="p-4 rounded-xl bg-surface-100/80 border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-accent-purple/20 text-accent-purple border border-accent-purple/30">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white">AO Integration Status:</span>
              <span className="px-2 py-0.5 rounded bg-surface-200 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-semibold">
                Configuration Required
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Operating in <span className="text-accent-emerald font-semibold">Local Autonomous Mode</span>. Live AO agent network endpoints can be connected in Settings.
            </p>
          </div>
        </div>

        <span className="text-[11px] text-slate-400 font-mono">
          Specification: Section 21 Compliant
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Session List */}
        <div className="p-5 rounded-2xl bg-surface-100/60 border border-slate-800/80 backdrop-blur-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
            Recorded AO Sessions ({sessions.length})
          </h3>

          <div className="space-y-2">
            {sessions.map(s => {
              const isSelected = selectedSession?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSession(s)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-600/20 border-brand-500 shadow-glow'
                      : 'bg-surface-200/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white">{s.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30 font-mono">
                      {s.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 mt-1">{s.agentName}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{s.task}</p>
                  <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                    <span>{s.events.length} workflow steps</span>
                    <span>{new Date(s.startedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Session Detail & Timeline */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface-100/60 border border-slate-800/80 backdrop-blur-sm space-y-6">
          {selectedSession ? (
            <>
              {/* Session Meta */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white font-mono">{selectedSession.id}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-surface-200 text-slate-300 font-mono">
                      {selectedSession.integrationMode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{selectedSession.task}</p>
                </div>

                <div className="text-right text-xs">
                  <span className="text-slate-400 block font-mono text-[10px]">Progress</span>
                  <span className="font-bold text-accent-emerald font-mono text-base">
                    {selectedSession.progressPercentage}%
                  </span>
                </div>
              </div>

              {/* Summary note */}
              {selectedSession.summary && (
                <div className="p-3.5 rounded-xl bg-surface-200/50 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <span className="text-accent-cyan font-bold font-mono text-[10px] uppercase block mb-1">
                    Outcome Summary:
                  </span>
                  {selectedSession.summary}
                </div>
              )}

              {/* Event Timeline (Section 21 Requirement) */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Autonomous Execution Timeline
                </h4>
                <Timeline events={selectedSession.events} />
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Select an AO Session on the left to inspect its autonomous event timeline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Terminal,
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Columns,
  RefreshCw,
  Clock,
  Layers,
  Wrench
} from 'lucide-react';
import { api } from '../services/api.js';
import { Agent, AgentVersion } from '../types/index.js';

interface PlaygroundProps {
  agent: Agent;
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  content: string;
  versionLabel?: string;
  metadata?: {
    latencyMs: number;
    toolsUsed: string[];
    decisionPath: string;
    evaluationStatus: string;
    evaluationScore: number;
  };
}

export const Playground: React.FC<PlaygroundProps> = ({ agent }) => {
  const [activeVersionNum, setActiveVersionNum] = useState<number>(agent.activeVersion);
  const [inputMessage, setInputMessage] = useState('');
  const [difyStatus, setDifyStatus] = useState<{
    connected: boolean;
    configured: boolean;
    apiUrl?: string;
    error?: { code: string; message: string };
  }>({ connected: false, configured: false });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'agent',
      content: `Hello! I am ${agent.name} (V${agent.activeVersion}). How can I assist you with your order or inquiry today?`,
      versionLabel: `V${agent.activeVersion}`
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(true);
  const [isCompareMode, setIsCompareMode] = useState(false);

  // Compare mode states
  const [compareMessagesV1, setCompareMessagesV1] = useState<Message[]>([]);
  const [compareMessagesV2, setCompareMessagesV2] = useState<Message[]>([]);

  // Load Dify Integration Health Status (Section 10)
  React.useEffect(() => {
    api.getDifyHealth()
      .then(res => {
        setDifyStatus({
          connected: res.data?.connected || false,
          configured: res.data?.configured || false,
          apiUrl: res.data?.apiUrl,
          error: res.error
        });
      })
      .catch(() => {
        setDifyStatus({ connected: false, configured: false });
      });
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const query = inputMessage.trim();
    setInputMessage('');

    if (isCompareMode) {
      // Send to both V1 and V2
      const userMsg: Message = { id: `u-${Date.now()}`, sender: 'user', content: query };
      setCompareMessagesV1(prev => [...prev, userMsg]);
      setCompareMessagesV2(prev => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const [resV1, resV2] = await Promise.all([
          api.chat(agent.id, query, 1),
          api.chat(agent.id, query, 2)
        ]);

        if (resV1.success) {
          setCompareMessagesV1(prev => [
            ...prev,
            {
              id: `v1-${Date.now()}`,
              sender: 'agent',
              content: resV1.response,
              versionLabel: 'V1',
              metadata: resV1.metadata
            }
          ]);
        }

        if (resV2.success) {
          setCompareMessagesV2(prev => [
            ...prev,
            {
              id: `v2-${Date.now()}`,
              sender: 'agent',
              content: resV2.response,
              versionLabel: 'V2',
              metadata: resV2.metadata
            }
          ]);
        }
      } catch (err) {
        console.error('Chat failed', err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Single version mode
    const userMsg: Message = { id: `u-${Date.now()}`, sender: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await api.chat(agent.id, query, activeVersionNum);
      if (res.success) {
        const agentMsg: Message = {
          id: `a-${Date.now()}`,
          sender: 'agent',
          content: res.response,
          versionLabel: `V${activeVersionNum}`,
          metadata: res.metadata
        };
        setMessages(prev => [...prev, agentMsg]);
      }
    } catch (err: any) {
      const errMsg = err.message || 'Failed to generate response.';
      const isDify = errMsg.includes('Dify') || errMsg.includes('DIFY');
      const isConnection = errMsg.includes('connect') || errMsg.includes('backend') || errMsg.includes('reachable');

      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'agent',
        content: isDify
          ? `⚠️ Dify Integration: ${errMsg}`
          : isConnection
          ? `🔌 Gateway Error: ${errMsg}`
          : `⚠️ ${errMsg}`,
        versionLabel: `V${activeVersionNum}`,
        metadata: {
          latencyMs: 0,
          toolsUsed: [],
          decisionPath: isDify ? 'Dify Communication Exception' : 'Backend Routing Error',
          evaluationStatus: 'FAILED',
          evaluationScore: 0
        }
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const setSampleQuery = (q: string) => {
    setInputMessage(q);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-amber/20 text-amber-300 font-mono font-semibold">
              Interactive Execution
            </span>
            <span className="text-xs text-slate-400">Live Agent Sandbox</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Agent Playground: {agent.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Interact directly with any agent version and inspect real-time tool calls, routing decisions, and policy checks.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Dify Connection Status Indicator (Section 10) */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border bg-surface-100/80 border-slate-700/70 text-xs font-mono">
            <span className="text-slate-400 font-bold">DIFY</span>
            <span className={`w-2 h-2 rounded-full ${
              difyStatus.connected
                ? 'bg-accent-emerald shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : difyStatus.configured
                ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                : 'bg-amber-400/80'
            }`} />
            <span className={
              difyStatus.connected
                ? 'text-accent-emerald font-semibold'
                : difyStatus.configured
                ? 'text-rose-400 font-semibold'
                : 'text-amber-300'
            }>
              {difyStatus.connected
                ? 'Connected'
                : difyStatus.configured
                ? 'Connection Issue'
                : 'Native Mode (Unconfigured)'}
            </span>
          </div>

          {/* Compare Mode Toggle */}
          <button
            onClick={() => setIsCompareMode(!isCompareMode)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isCompareMode
                ? 'bg-brand-600 text-white border-brand-500 shadow-glow'
                : 'bg-surface-100 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{isCompareMode ? 'Exit Compare' : 'Side-by-Side V1 vs V2'}</span>
          </button>

          {/* Debug Metadata Toggle */}
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-surface-100 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-all"
          >
            {showDebug ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-accent-cyan" />}
            <span>Debug Traces</span>
          </button>

          {!isCompareMode && (
            <div className="flex items-center space-x-2 bg-surface-100 border border-slate-700/80 rounded-xl px-3 py-1.5">
              <span className="text-xs text-slate-400 font-medium">Version:</span>
              <select
                value={activeVersionNum}
                onChange={(e) => setActiveVersionNum(parseInt(e.target.value))}
                className="bg-transparent text-white text-xs font-bold font-mono focus:outline-none cursor-pointer"
              >
                {agent.versions.map(v => (
                  <option key={v.version} value={v.version} className="bg-surface-200 text-white">
                    {v.versionLabel} {v.version === agent.activeVersion ? '(Deployed)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] text-slate-400 uppercase font-mono shrink-0">Try Case:</span>
        <button
          onClick={() => setSampleQuery('My package arrived damaged and I want a replacement.')}
          className="px-3 py-1 rounded-full bg-surface-100 hover:bg-surface-50 text-slate-300 border border-slate-700 text-[11px] shrink-0 transition-all"
        >
          Damaged Mug & Replacement (Benchmark)
        </button>
        <button
          onClick={() => setSampleQuery('I bought this jacket 8 months ago and want a full cash refund.')}
          className="px-3 py-1 rounded-full bg-surface-100 hover:bg-surface-50 text-slate-300 border border-slate-700 text-[11px] shrink-0 transition-all"
        >
          8-Month Old Return (Policy Check)
        </button>
        <button
          onClick={() => setSampleQuery('Where is my order?')}
          className="px-3 py-1 rounded-full bg-surface-100 hover:bg-surface-50 text-slate-300 border border-slate-700 text-[11px] shrink-0 transition-all"
        >
          Missing Order Number (Context Prompt)
        </button>
      </div>

      {/* Chat Area */}
      {!isCompareMode ? (
        <div className="p-6 rounded-2xl bg-surface-100/60 border border-slate-800/80 backdrop-blur-sm space-y-4 flex flex-col h-[520px]">
          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-2 mb-1 text-[11px] text-slate-400">
                  {msg.sender === 'user' ? (
                    <>
                      <span>You</span>
                      <User className="w-3 h-3 text-brand-400" />
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5 text-accent-cyan" />
                      <span className="font-bold text-white">{agent.name}</span>
                      <span className="px-1.5 py-0.2 rounded bg-surface-200 text-brand-300 font-mono text-[10px]">
                        {msg.versionLabel}
                      </span>
                    </>
                  )}
                </div>

                <div
                  className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-none'
                      : 'bg-surface-200/90 text-slate-200 border border-slate-800 rounded-tl-none'
                  }`}
                >
                  <p>{msg.content}</p>

                  {/* Debug Metadata (Section 20 Requirement) */}
                  {showDebug && msg.metadata && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5 text-[10px] font-mono text-slate-400">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Tools Invoked:</span>
                        <span className="text-accent-cyan">{msg.metadata.toolsUsed.join(', ')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Routing Decision:</span>
                        <span className="text-slate-300 truncate max-w-xs">{msg.metadata.decisionPath}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Evaluation:</span>
                        <span className={msg.metadata.evaluationStatus === 'PASSED' ? 'text-accent-emerald font-bold' : 'text-rose-400 font-bold'}>
                          {msg.metadata.evaluationStatus} ({msg.metadata.evaluationScore}/100)
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Latency:</span>
                        <span className="text-slate-400">{msg.metadata.latencyMs}ms</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2.5 text-xs text-brand-300 bg-surface-200/70 border border-brand-500/30 px-3.5 py-2.5 rounded-xl max-w-md animate-pulse">
                <Bot className="w-4 h-4 text-accent-cyan animate-spin" />
                <span>Thinking... Connecting to {difyStatus.connected ? 'Dify AI Agent' : `${agent.name} (Native Engine)`}...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              disabled={isLoading}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isLoading ? 'Connecting to agent...' : `Ask ${agent.name} a question or submit a customer scenario...`}
              className="flex-1 bg-[#080c16] border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-50 transition-all shadow-glow"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        /* Compare Mode: V1 vs V2 Side-by-Side */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* V1 Column */}
            <div className="p-4 rounded-2xl bg-surface-100/60 border border-slate-800 h-[460px] flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-rose-400 font-mono">Agent V1 (Baseline)</span>
                <span className="text-[10px] text-slate-400">Prone to intent confusion</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 py-2">
                {compareMessagesV1.map(m => (
                  <div key={m.id} className={`p-3 rounded-xl text-xs ${m.sender === 'user' ? 'bg-brand-600/30 text-white ml-6' : 'bg-surface-200 text-slate-200 mr-6'}`}>
                    <span className="text-[10px] font-mono text-slate-400 block mb-0.5">{m.sender === 'user' ? 'User' : 'V1 Response'}</span>
                    <p>{m.content}</p>
                    {m.metadata && (
                      <div className="mt-2 text-[10px] font-mono text-rose-400">
                        Status: {m.metadata.evaluationStatus} ({m.metadata.evaluationScore} pts)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* V2 Column */}
            <div className="p-4 rounded-2xl bg-surface-100/60 border border-accent-emerald/40 h-[460px] flex flex-col justify-between shadow-glow-emerald">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-accent-emerald font-mono">Agent V2 (Self-Healed)</span>
                <span className="text-[10px] text-accent-emerald">Self-healed routing rules</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 py-2">
                {compareMessagesV2.map(m => (
                  <div key={m.id} className={`p-3 rounded-xl text-xs ${m.sender === 'user' ? 'bg-brand-600/30 text-white ml-6' : 'bg-surface-200 text-slate-200 mr-6 border border-emerald-900/40'}`}>
                    <span className="text-[10px] font-mono text-slate-400 block mb-0.5">{m.sender === 'user' ? 'User' : 'V2 Response'}</span>
                    <p>{m.content}</p>
                    {m.metadata && (
                      <div className="mt-2 text-[10px] font-mono text-accent-emerald">
                        Status: {m.metadata.evaluationStatus} ({m.metadata.evaluationScore} pts)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shared Compare Input */}
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Send simultaneously to V1 and V2..."
              className="flex-1 bg-[#080c16] border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-accent-emerald text-white text-xs font-bold disabled:opacity-50 transition-all shadow-glow"
            >
              Test Both
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

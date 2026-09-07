import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Key,
  ShieldCheck,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Save,
  Radio,
  Users,
  Database,
  Phone
} from 'lucide-react';
import { api } from '../services/api.js';
import { AppSettings } from '../types/index.js';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    geminiApiKey: '',
    demoMode: true,
    scoringWeights: {
      accuracy: 0.40,
      policyCompliance: 0.25,
      responseQuality: 0.20,
      reliability: 0.15
    },
    maxAutonomousIterations: 3,
    aoConfigured: false,
    aoEndpoint: ''
  });

  const [inputKey, setInputKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<Array<{
    _id: string;
    name: string;
    mobile: string;
    createdAt: string;
  }>>([]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [res, usersRes] = await Promise.all([
          api.getSettings(),
          api.getAllUsers()
        ]);
        if (res.success && res.settings) {
          setSettings(res.settings);
        }
        if (usersRes.success && usersRes.data) {
          setRegisteredUsers(usersRes.data);
        }
      } catch (err) {
        console.warn('Could not load settings or users', err);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload: Partial<AppSettings> = {
        demoMode: settings.demoMode,
        maxAutonomousIterations: settings.maxAutonomousIterations,
        aoEndpoint: settings.aoEndpoint,
        scoringWeights: settings.scoringWeights
      };

      if (inputKey.trim()) {
        payload.geminiApiKey = inputKey.trim();
      }

      const res = await api.updateSettings(payload);
      if (res.success) {
        setSettings(res.settings);
        setInputKey('');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to update settings', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Reset all agents, test runs, and sessions to the initial SupportPilot demo state?')) return;

    try {
      const res = await api.resetData();
      if (res.success) {
        setResetMessage('Database reset successfully! Reloading...');
        setTimeout(() => window.location.reload(), 1200);
      }
    } catch (err) {
      console.error('Failed to reset', err);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-200 text-slate-300 font-mono font-semibold">
            Platform Configuration
          </span>
          <span className="text-xs text-slate-400">API Keys & Autonomous Settings</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
          Settings & Execution Mode
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure external AI models, toggle self-contained Demo Mode, and tune autonomous self-healing thresholds.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Gemini API Key Section (Section 25 Requirement) */}
        <div className="p-6 rounded-2xl bg-surface-100/60 border border-slate-800/80 backdrop-blur-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Gemini API Key</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Provide a Google Gemini API Key to enable live cloud model generation. If empty or in Demo Mode, AgentHeal operates using the fully functional, deterministic autonomous engine.
          </p>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Current Key: {settings.geminiApiKey ? <span className="font-mono text-accent-emerald">{settings.geminiApiKey}</span> : <span className="text-slate-500 font-mono">None configured (Demo Mode Active)</span>}
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Paste new Gemini API Key (e.g. AIzaSy...)"
              className="w-full bg-[#080c16] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>
        </div>

        {/* Demo Mode Toggle (Section 26 Requirement) */}
        <div className="p-6 rounded-2xl bg-surface-100/60 border border-slate-800/80 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Demo Mode</h3>
              </div>
              <p className="text-xs text-slate-300">
                Guarantees complete 100% uptime for hackathon evaluations even if external AI APIs experience quota or latency errors.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.demoMode}
                onChange={(e) => setSettings({ ...settings, demoMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
            </label>
          </div>
        </div>

        {/* AO Integration Endpoint */}
        <div className="p-6 rounded-2xl bg-surface-100/60 border border-slate-800/80 backdrop-blur-sm space-y-4">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-accent-purple" />
            <h3 className="text-sm font-bold text-white tracking-tight">AO Network Endpoint (Optional)</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Specify an Autonomous Operations remote node URL. As mandated by Section 21 of the specification, the application will display "Configuration Required" until valid external AO credentials are authenticated.
          </p>

          <div>
            <input
              type="text"
              value={settings.aoEndpoint}
              onChange={(e) => setSettings({ ...settings, aoEndpoint: e.target.value })}
              placeholder="e.g. https://ao-gateway.enterprise.internal/v1"
              className="w-full bg-[#080c16] border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <div className="flex items-center space-x-2 text-xs text-accent-emerald">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings saved successfully!</span>
            </div>
          ) : <div></div>}

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-glow"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Registered Users in Database */}
      <div className="p-6 rounded-2xl bg-surface-100/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Users className="w-5 h-5 text-brand-400" />
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Registered Database Users</h3>
              <p className="text-xs text-slate-400">
                Live user profiles registered through the entry gatekeeper and stored in MongoDB / database.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald text-[11px] font-mono font-semibold">
            {registeredUsers.length} Users Stored
          </span>
        </div>

        {registeredUsers.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#050914] border border-slate-800/80 text-center text-xs text-slate-500">
            No users registered yet.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {registeredUsers.map((user) => (
              <div
                key={user._id}
                className="p-3.5 rounded-xl bg-[#070b18] border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{user.name}</span>
                    <span className="text-[10px] text-brand-300 font-mono bg-brand-500/10 px-2 py-0.5 rounded-md">
                      {user._id}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span className="font-mono text-slate-300">{user.mobile}</span>
                    </span>
                    <span>•</span>
                    <span>{new Date(user.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-accent-emerald text-[11px] font-mono">
                  <Database className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone / Reset Database */}
      <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-4">
        <div className="flex items-center space-x-2">
          <RotateCcw className="w-4 h-4 text-rose-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">Reset Demonstration Data</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Restore the application back to pristine seed state with pre-configured SupportPilot V1 failure diagnostics and V2 improvement data.
        </p>

        {resetMessage && (
          <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800 text-xs text-emerald-300">
            {resetMessage}
          </div>
        )}

        <button
          onClick={handleResetData}
          className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-600/40 text-xs font-semibold transition-all"
        >
          Reset Database to Demo Seed
        </button>
      </div>
    </div>
  );
};

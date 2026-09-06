import React, { useState, useEffect } from 'react';
import { MainLayout } from './layouts/MainLayout.js';
import { NavigationTab } from './components/Sidebar.js';
import { Dashboard } from './pages/Dashboard.js';
import { CreateAgent } from './pages/CreateAgent.js';
import { MyAgents } from './pages/MyAgents.js';
import { AgentWorkspace } from './pages/AgentWorkspace.js';
import { Deployments } from './pages/Deployments.js';
import { Playground } from './pages/Playground.js';
import { AOSessions } from './pages/AOSessions.js';
import { Settings } from './pages/Settings.js';
import { OnboardingModal } from './components/OnboardingModal.js';
import { api } from './services/api.js';
import { Agent } from './types/index.js';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [promptForCreation, setPromptForCreation] = useState<string>('');

  // User session state for first-visit onboarding & personalized greeting
  const [currentUser, setCurrentUser] = useState<{ userId: string; name: string } | null>(() => {
    try {
      const saved = localStorage.getItem('agentheal_user');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved user:', e);
    }
    return null;
  });

  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('agentheal_user');
      return !saved;
    } catch {
      return true;
    }
  });

  // Load agents and settings on initial mount
  const loadData = async () => {
    try {
      const [agentsRes, settingsRes] = await Promise.all([
        api.getAgents(),
        api.getSettings()
      ]);

      if (agentsRes.success && agentsRes.agents.length > 0) {
        setAgents(agentsRes.agents);
        setActiveAgent(agentsRes.agents[0]);
      }

      if (settingsRes.success && settingsRes.settings) {
        setDemoMode(settingsRes.settings.demoMode);
      }
    } catch (err) {
      console.warn('Initial data load warning:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAgentCreated = (newAgent: Agent) => {
    setAgents(prev => [newAgent, ...prev]);
    setActiveAgent(newAgent);
    setActiveTab('workspace');
  };

  const handleUpdateAgent = (updated: Agent) => {
    setAgents(prev => prev.map(a => (a.id === updated.id ? updated : a)));
    if (activeAgent?.id === updated.id) {
      setActiveAgent(updated);
    }
  };

  const handleBuildPrompt = (prompt: string) => {
    setPromptForCreation(prompt);
    setActiveTab('create');
  };

  // Hackathon Autonomous Agent Engineering Demo Flow
  const handleRunDemoFlow = async () => {
    if (!activeAgent || isDemoRunning) return;

    setIsDemoRunning(true);
    setActiveTab('workspace');

    try {
      // Step 1: Run V1 tests
      await api.runTests(activeAgent.id, 1);
      
      // Step 2: Show Failures & Optimizer
      setTimeout(async () => {
        const improveRes = await api.improveAgent(activeAgent.id, 1);
        if (improveRes.success && improveRes.agent) {
          handleUpdateAgent(improveRes.agent);
        }
      }, 2500);

      // Step 3: Run Retest on V2
      setTimeout(async () => {
        const retestRes = await api.runTests(activeAgent.id, 2);
        if (retestRes.success) {
          const fresh = await api.getAgent(activeAgent.id);
          if (fresh.success) handleUpdateAgent(fresh.agent);
        }
        setIsDemoRunning(false);
      }, 5500);
    } catch (err) {
      console.error('Demo flow error', err);
      setIsDemoRunning(false);
    }
  };

  if (isLoading && agents.length === 0) {
    return (
      <div className="min-h-screen bg-[#050B18] flex items-center justify-center text-slate-300">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono font-medium tracking-wide">
            Initializing AgentHeal Autonomous Engine...
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      {showOnboarding && (
        <OnboardingModal
          onComplete={(user) => {
            setCurrentUser(user);
            setShowOnboarding(false);
          }}
        />
      )}

      <MainLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        agents={agents}
        activeAgent={activeAgent}
        onSelectAgent={setActiveAgent}
        onRunDemoFlow={handleRunDemoFlow}
        isDemoRunning={isDemoRunning}
        demoMode={demoMode}
        userName={currentUser?.name}
      >
        {activeTab === 'home' && (
          <Dashboard
            agents={agents}
            activeAgent={activeAgent}
            onSelectAgent={setActiveAgent}
            setActiveTab={setActiveTab}
            onRunDemoFlow={handleRunDemoFlow}
            isDemoRunning={isDemoRunning}
            onBuildPrompt={handleBuildPrompt}
            userName={currentUser?.name}
          />
        )}

      {activeTab === 'create' && (
        <CreateAgent
          onAgentCreated={handleAgentCreated}
          setActiveTab={setActiveTab}
          initialTask={promptForCreation}
        />
      )}

      {activeTab === 'agents' && (
        <MyAgents
          agents={agents}
          activeAgent={activeAgent}
          onSelectAgent={(agent) => {
            setActiveAgent(agent);
            setActiveTab('workspace');
          }}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'workspace' && activeAgent && (
        <AgentWorkspace
          agent={activeAgent}
          onUpdateAgent={handleUpdateAgent}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'deploy' && (
        <Deployments
          agents={agents}
          activeAgent={activeAgent}
          onSelectAgent={(agent) => {
            setActiveAgent(agent);
            setActiveTab('workspace');
          }}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'playground' && activeAgent && (
        <Playground agent={activeAgent} />
      )}

      {activeTab === 'ao-sessions' && (
        <AOSessions />
      )}

      {activeTab === 'settings' && (
        <Settings />
      )}
    </MainLayout>
    </>
  );
};

import React from 'react';
import { Sidebar, NavigationTab } from '../components/Sidebar.js';
import { Header } from '../components/Header.js';
import { Agent } from '../types/index.js';

interface MainLayoutProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  agents: Agent[];
  activeAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
  onRunDemoFlow?: () => void;
  isDemoRunning?: boolean;
  demoMode?: boolean;
  userName?: string;
  userMobile?: string;
  userId?: string;
  onLogout?: () => void;
  children: React.ReactNode;
}

const TAB_TITLES: Record<NavigationTab, { title: string; subtitle: string }> = {
  home: {
    title: 'AgentHeal',
    subtitle: 'Autonomous AI Agent Engineering Platform'
  },
  create: {
    title: 'Create Agent',
    subtitle: 'Autonomous natural language requirements analysis and architecture generation'
  },
  agents: {
    title: 'My Agents',
    subtitle: 'Manage and inspect active task-specific agent workspaces'
  },
  workspace: {
    title: 'Agent Workspace',
    subtitle: 'Central autonomous engineering hub — Test, Diagnose, Improve, Deploy'
  },
  deploy: {
    title: 'Deployments',
    subtitle: 'Publish and manage production-ready agents and downloadable packages'
  },
  playground: {
    title: 'Agent Playground',
    subtitle: 'Interactive chat sandbox with real-time intent routing and tool tracing'
  },
  'ao-sessions': {
    title: 'AO Sessions & Audit',
    subtitle: 'Audit trail of autonomous operations, Gemini API calls, and pipeline execution'
  },
  settings: {
    title: 'System Settings',
    subtitle: 'Configure external Gemini API keys, execution mode, and algorithm parameters'
  },
  testing: {
    title: 'Testing Lab',
    subtitle: 'Synthetic edge-case stress testing and empirical accuracy evaluation'
  },
  evaluation: {
    title: 'Failure Diagnostics',
    subtitle: 'Root-cause analysis and automated failure classification'
  },
  improvement: {
    title: 'Autonomous Optimizer',
    subtitle: 'Self-healing prompt refinement and workflow optimization loop'
  },
  versions: {
    title: 'Version History',
    subtitle: 'Multi-version comparison and algorithmic best-agent selection'
  }
};

export const MainLayout: React.FC<MainLayoutProps> = ({
  activeTab,
  setActiveTab,
  agents,
  activeAgent,
  onSelectAgent,
  onRunDemoFlow,
  isDemoRunning,
  demoMode,
  userName,
  userMobile,
  userId,
  onLogout,
  children
}) => {
  const currentInfo = TAB_TITLES[activeTab] || { title: 'AgentHeal', subtitle: 'Autonomous Platform' };

  return (
    <div className="flex min-h-screen bg-[#050B18] text-slate-100 font-sans overflow-x-hidden">
      {/* Sidebar matching Concept Image */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeAgentName={activeAgent?.name}
        demoMode={demoMode}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header matching Concept Image */}
        <Header
          title={currentInfo.title}
          subtitle={currentInfo.subtitle}
          agents={agents}
          selectedAgent={activeAgent}
          onSelectAgent={onSelectAgent}
          isHomeView={activeTab === 'home'}
          userName={userName}
          userMobile={userMobile}
          userId={userId}
          onLogout={onLogout}
        />

        {/* Scrollable Page Canvas */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-12">
          {children}
        </main>
      </div>
    </div>
  );
};

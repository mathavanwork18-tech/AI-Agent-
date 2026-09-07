import {
  Agent,
  AgentRequirement,
  AOSession,
  AppSettings,
  FailureAnalysisReport,
  OptimizationResult,
  TestCase,
  TestRun
} from '../types/index.js';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35000);

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      let errorMessage = `HTTP error ${res.status}`;
      if (errData) {
        if (typeof errData.error === 'object' && errData.error?.message) {
          errorMessage = errData.error.message;
        } else if (typeof errData.error === 'string') {
          errorMessage = errData.error;
        } else if (errData.message) {
          errorMessage = errData.message;
        }
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. The agent or Dify service took longer than 35s to respond.');
    }
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      throw new Error('Unable to connect to AgentHeal backend. Check that the backend server is reachable on http://localhost:3001.');
    }
    throw err;
  }
}

export const api = {
  // Agents
  async getAgents(): Promise<{ success: boolean; agents: Agent[] }> {
    return fetchJson(`${API_BASE}/agents`);
  },

  async getAgent(id: string): Promise<{ success: boolean; agent: Agent }> {
    return fetchJson(`${API_BASE}/agents/${id}`);
  },

  async analyzeRequirement(requirement: AgentRequirement): Promise<{ success: boolean; analysis: any }> {
    return fetchJson(`${API_BASE}/agents/analyze`, {
      method: 'POST',
      body: JSON.stringify(requirement)
    });
  },

  async createAgent(requirement: AgentRequirement): Promise<{
    success: boolean;
    agent: Agent;
    analysis: any;
    architecture: any;
    testCases: TestCase[];
  }> {
    return fetchJson(`${API_BASE}/agents/create`, {
      method: 'POST',
      body: JSON.stringify(requirement)
    });
  },

  async runTests(agentId: string, version?: number): Promise<{
    success: boolean;
    testRun: TestRun;
    metrics: any;
    version: any;
  }> {
    return fetchJson(`${API_BASE}/agents/${agentId}/test`, {
      method: 'POST',
      body: JSON.stringify({ version })
    });
  },

  async analyzeFailures(agentId: string, version?: number): Promise<{
    success: boolean;
    failureReport: FailureAnalysisReport;
  }> {
    return fetchJson(`${API_BASE}/agents/${agentId}/analyze-failures`, {
      method: 'POST',
      body: JSON.stringify({ version })
    });
  },

  async improveAgent(agentId: string, version?: number): Promise<{
    success: boolean;
    optimization: OptimizationResult;
    newVersion: any;
    agent: Agent;
  }> {
    return fetchJson(`${API_BASE}/agents/${agentId}/improve`, {
      method: 'POST',
      body: JSON.stringify({ version })
    });
  },

  async runAutonomousIteration(agentId: string): Promise<{
    success: boolean;
    agent: Agent;
    session: AOSession;
  }> {
    return fetchJson(`${API_BASE}/agents/${agentId}/iterate`, {
      method: 'POST'
    });
  },

  async getTests(agentId: string): Promise<{
    success: boolean;
    testCases: TestCase[];
    testRuns: TestRun[];
  }> {
    return fetchJson(`${API_BASE}/agents/${agentId}/tests`);
  },

  async chat(agentId: string, message: string, version?: number, provider?: string): Promise<{
    success: boolean;
    response: string;
    version: string;
    provider?: string;
    data?: any;
    metadata: {
      latencyMs: number;
      toolsUsed: string[];
      decisionPath: string;
      evaluationStatus: string;
      evaluationScore: number;
    };
  }> {
    return fetchJson(`${API_BASE}/agents/${agentId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, version, provider })
    });
  },

  // Integrations & Health
  async getDifyHealth(): Promise<{
    success: boolean;
    data: {
      provider: string;
      connected: boolean;
      configured: boolean;
      apiUrl?: string;
    };
    error?: {
      code: string;
      message: string;
    };
  }> {
    try {
      return await fetchJson(`${API_BASE}/integrations/dify/health`);
    } catch (err: any) {
      return {
        success: false,
        data: { provider: 'dify', connected: false, configured: false },
        error: { code: 'BACKEND_CONNECTION_ERROR', message: err.message || 'Unable to connect to backend' }
      };
    }
  },

  // Deployments
  async getDeployments(): Promise<{ success: boolean; deployments: any[] }> {
    return fetchJson(`${API_BASE}/deployments`);
  },

  async deployAgent(agentId: string, version?: number, environment?: string): Promise<{
    success: boolean;
    deployment: any;
    message: string;
  }> {
    return fetchJson(`${API_BASE}/agents/${agentId}/deploy`, {
      method: 'POST',
      body: JSON.stringify({ version, environment })
    });
  },

  getDownloadUrl(deploymentId: string): string {
    return `${API_BASE}/deployments/${deploymentId}/download`;
  },

  // Sessions & Settings
  async getAOSessions(): Promise<{ success: boolean; sessions: AOSession[] }> {
    return fetchJson(`${API_BASE}/ao-sessions`);
  },

  async getSettings(): Promise<{ success: boolean; settings: AppSettings }> {
    return fetchJson(`${API_BASE}/settings`);
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<{ success: boolean; settings: AppSettings }> {
    return fetchJson(`${API_BASE}/settings`, {
      method: 'POST',
      body: JSON.stringify(settings)
    });
  },

  // User Onboarding & Profiles
  async onboardUser(data: { name: string; mobile: string }): Promise<{
    success: boolean;
    data: { userId: string; name: string; mobile: string; createdAt?: string };
    error?: { code: string; message: string };
  }> {
    return fetchJson(`${API_BASE}/users/onboard`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getUserSession(userId: string): Promise<{
    success: boolean;
    data: { userId: string; name: string; mobile?: string; createdAt?: string; lastSeenAt?: string };
    error?: { code: string; message: string };
  }> {
    return fetchJson(`${API_BASE}/users/session/${userId}`);
  },

  async getAllUsers(): Promise<{
    success: boolean;
    data: Array<{ _id: string; name: string; mobile: string; createdAt: string; lastSeenAt?: string }>;
    count?: number;
    error?: { code: string; message: string };
  }> {
    return fetchJson(`${API_BASE}/users`);
  },

  async resetData(): Promise<{ success: boolean; message: string }> {
    return fetchJson(`${API_BASE}/reset`, {
      method: 'POST'
    });
  }
};

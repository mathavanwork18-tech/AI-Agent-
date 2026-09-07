import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Agent, TestCase, TestRun, FailureAnalysisReport, AOSession, AppSettings, AgentVersion, Deployment } from '../types/index.js';
import { SEED_AGENT, SEED_TEST_CASES, SEED_FAILURE_REPORT, SEED_AO_SESSIONS, SEED_DEPLOYMENT } from './seedData.js';
import { TestCaseGenerator } from '../ai/testGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  agents: Record<string, Agent>;
  testCases: Record<string, TestCase[]>;
  testRuns: Record<string, TestRun[]>;
  failureReports: Record<string, FailureAnalysisReport>;
  aoSessions: AOSession[];
  deployments: Record<string, Deployment>;
  settings: AppSettings;
  users?: Record<string, any>;
}

const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  demoMode: false,
  scoringWeights: {
    accuracy: 0.40,
    policyCompliance: 0.25,
    responseQuality: 0.20,
    reliability: 0.15
  },
  maxAutonomousIterations: 3,
  aoConfigured: false,
  aoEndpoint: process.env.AO_API_ENDPOINT || ''
};

class StorageRepository {
  private db: DatabaseSchema;

  constructor() {
    this.db = {
      agents: {},
      testCases: {},
      testRuns: {},
      failureReports: {},
      aoSessions: [],
      deployments: {},
      settings: DEFAULT_SETTINGS
    };
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = JSON.parse(raw);
        if (!this.db.deployments) {
          this.db.deployments = { [SEED_DEPLOYMENT.id]: SEED_DEPLOYMENT };
        }
      } else {
        // Seed default agent
        this.db.agents[SEED_AGENT.id] = SEED_AGENT;
        this.db.testCases[SEED_AGENT.id] = SEED_TEST_CASES;
        this.db.failureReports[`${SEED_AGENT.id}-v1`] = SEED_FAILURE_REPORT;
        this.db.aoSessions = SEED_AO_SESSIONS;
        this.db.deployments = { [SEED_DEPLOYMENT.id]: SEED_DEPLOYMENT };
        this.persist();
      }
    } catch (err) {
      console.warn('Storage init fallback to memory:', err);
      this.db.agents[SEED_AGENT.id] = SEED_AGENT;
      this.db.testCases[SEED_AGENT.id] = SEED_TEST_CASES;
      this.db.failureReports[`${SEED_AGENT.id}-v1`] = SEED_FAILURE_REPORT;
      this.db.aoSessions = SEED_AO_SESSIONS;
      this.db.deployments = { [SEED_DEPLOYMENT.id]: SEED_DEPLOYMENT };
    }
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  // AGENTS
  getAllAgents(): Agent[] {
    return Object.values(this.db.agents);
  }

  getAgentById(id: string): Agent | null {
    return this.db.agents[id] || null;
  }

  saveAgent(agent: Agent): Agent {
    this.db.agents[agent.id] = {
      ...agent,
      updatedAt: new Date().toISOString()
    };
    this.persist();
    return this.db.agents[agent.id];
  }

  addAgentVersion(agentId: string, version: AgentVersion): Agent | null {
    const agent = this.db.agents[agentId];
    if (!agent) return null;

    const existingIdx = agent.versions.findIndex(v => v.version === version.version);
    if (existingIdx >= 0) {
      agent.versions[existingIdx] = version;
    } else {
      agent.versions.push(version);
    }
    agent.activeVersion = version.version;
    agent.status = 'READY';
    agent.updatedAt = new Date().toISOString();
    this.persist();
    return agent;
  }

  // DEPLOYMENTS
  getAllDeployments(): Deployment[] {
    return Object.values(this.db.deployments || {});
  }

  getDeploymentById(id: string): Deployment | null {
    return (this.db.deployments || {})[id] || null;
  }

  saveDeployment(dep: Deployment): Deployment {
    if (!this.db.deployments) this.db.deployments = {};
    this.db.deployments[dep.id] = dep;
    
    // Update agent status
    const agent = this.db.agents[dep.agentId];
    if (agent) {
      agent.status = 'DEPLOYED';
      if (!agent.deployments) agent.deployments = [];
      const dIdx = agent.deployments.findIndex(d => d.id === dep.id);
      if (dIdx >= 0) agent.deployments[dIdx] = dep;
      else agent.deployments.unshift(dep);
      this.db.agents[agent.id] = agent;
    }

    this.persist();
    return dep;
  }

  // TEST CASES
  getTestCases(agentId: string): TestCase[] {
    let existing = this.db.testCases[agentId];
    if (!existing || existing.length < 8 || !existing.some(t => t.id === 'TC-002')) {
      existing = TestCaseGenerator.validateAndRepairTestSuite(agentId, existing || []);
      this.db.testCases[agentId] = existing;
      this.persist();
    }
    return existing;
  }

  saveTestCases(agentId: string, testCases: TestCase[]): TestCase[] {
    this.db.testCases[agentId] = testCases;
    this.persist();
    return testCases;
  }

  // TEST RUNS
  getTestRuns(agentId: string): TestRun[] {
    return this.db.testRuns[agentId] || [];
  }

  saveTestRun(agentId: string, run: TestRun): TestRun {
    if (!this.db.testRuns[agentId]) {
      this.db.testRuns[agentId] = [];
    }
    this.db.testRuns[agentId].unshift(run);
    this.persist();
    return run;
  }

  // FAILURE REPORTS
  getFailureReport(agentId: string, version: number): FailureAnalysisReport | null {
    return this.db.failureReports[`${agentId}-v${version}`] || null;
  }

  saveFailureReport(report: FailureAnalysisReport): FailureAnalysisReport {
    this.db.failureReports[`${report.agentId}-v${report.version}`] = report;
    this.persist();
    return report;
  }

  // AO SESSIONS
  getAllAOSessions(): AOSession[] {
    return this.db.aoSessions;
  }

  getAOSessionById(id: string): AOSession | null {
    return this.db.aoSessions.find(s => s.id === id) || null;
  }

  saveAOSession(session: AOSession): AOSession {
    const idx = this.db.aoSessions.findIndex(s => s.id === session.id);
    if (idx >= 0) {
      this.db.aoSessions[idx] = session;
    } else {
      this.db.aoSessions.unshift(session);
    }
    this.persist();
    return session;
  }

  // SETTINGS
  getSettings(): AppSettings {
    return this.db.settings;
  }

  updateSettings(settings: Partial<AppSettings>): AppSettings {
    this.db.settings = {
      ...this.db.settings,
      ...settings,
      scoringWeights: {
        ...this.db.settings.scoringWeights,
        ...(settings.scoringWeights || {})
      }
    };
    this.persist();
    return this.db.settings;
  }

  // USER MANAGEMENT
  saveUser(userData: { name: string; mobile: string; createdAt: string; lastSeenAt: string }): any {
    if (!this.db.users) {
      this.db.users = {};
    }
    const existing = Object.values(this.db.users).find((u: any) => u.mobile === userData.mobile);
    if (existing) {
      existing.lastSeenAt = userData.lastSeenAt;
      existing.name = userData.name;
      this.persist();
      return existing;
    }

    const _id = `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const user = {
      _id,
      ...userData
    };
    this.db.users[_id] = user;
    this.persist();
    return user;
  }

  getUserById(userId: string): any {
    if (!this.db.users) return null;
    return this.db.users[userId] || null;
  }

  getAllUsers(): any[] {
    if (!this.db.users) return [];
    return Object.values(this.db.users);
  }

  // RESET TO SEED
  resetToSeed(): void {
    this.db = {
      agents: { [SEED_AGENT.id]: SEED_AGENT },
      testCases: { [SEED_AGENT.id]: SEED_TEST_CASES },
      testRuns: {},
      failureReports: { [`${SEED_AGENT.id}-v1`]: SEED_FAILURE_REPORT },
      aoSessions: SEED_AO_SESSIONS,
      deployments: { [SEED_DEPLOYMENT.id]: SEED_DEPLOYMENT },
      settings: DEFAULT_SETTINGS,
      users: {}
    };
    this.persist();
  }
}

export const storage = new StorageRepository();

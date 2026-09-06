export type AgentStatus = 'DRAFT' | 'BUILDING' | 'READY' | 'TESTING' | 'FAILED' | 'IMPROVING' | 'DEPLOYED' | 'ARCHIVED';

export interface AgentRequirement {
  task: string;
  name?: string;
  industry?: string;
  goal?: string;
  requiredTools?: string[];
  constraints?: string[];
  expectedOutput?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface TaskAnalysis {
  task: string;
  domain: string;
  goal: string;
  userTypes: string[];
  constraints: string[];
  requiredCapabilities: string[];
  requiredTools: string[];
  evaluationCriteria: string[];
}

export interface AgentSpec {
  name: string;
  description: string;
  objective: string;
  target_users: string[];
  capabilities: string[];
  intents: string[];
  policies: string[];
  constraints: string[];
  required_information: string[];
  forbidden_behaviors: string[];
  tools: string[];
  workflow: string[];
  system_instructions: string;
  evaluation_criteria: string[];
}

export interface AgentArchitecture {
  agentName: string;
  role: string;
  objective: string;
  systemInstructions: string;
  tools: string[];
  memoryStrategy: string;
  workflow: string[];
  constraints: string[];
  successCriteria: string[];
}

export interface AgentVersionMetrics {
  accuracy: number;
  policyCompliance: number;
  responseQuality: number;
  hallucinationRate: number;
  reliability: number;
  avgResponseTimeMs: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  finalScore?: number;
}

export interface AgentVersion {
  id: string;
  agentId: string;
  version: number;
  versionLabel: string;
  systemPrompt: string;
  capabilities?: string[];
  policies?: string[];
  constraints: string[];
  workflow: string[];
  required_information?: string[];
  forbidden_behaviors?: string[];
  tools: string[];
  evaluationCriteria: string[];
  metrics: AgentVersionMetrics;
  changelog?: {
    whatChanged: string[];
    whyChanged: string;
    expectedImpact: string;
  };
  parent_version_id?: string;
  generated_at?: string;
  createdAt: string;
}

export interface Deployment {
  id: string;
  agentId: string;
  agentName: string;
  version: number;
  versionLabel: string;
  status: 'DEPLOYED' | 'ACTIVE' | 'ARCHIVED';
  accuracy: number;
  environment: 'production' | 'staging';
  deployedAt: string;
  downloadCount: number;
  configSummary?: string;
}

export interface Agent {
  id: string;
  name: string;
  industry: string;
  goal: string;
  description: string;
  status: AgentStatus;
  activeVersion: number;
  requirement: AgentRequirement;
  analysis: TaskAnalysis;
  architecture: AgentArchitecture;
  spec?: AgentSpec;
  versions: AgentVersion[];
  deployments?: Deployment[];
  provider?: 'dify' | 'gemini' | 'hybrid' | 'agentheal-native' | string;
  dify_app_id?: string;
  healing_status?: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'MAX_ITERATIONS_REACHED';
  test_suite_id?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestCase {
  id: string;
  agentId: string;
  name?: string;
  category: string;
  query: string;
  input: string;
  expected_intent?: string;
  required_actions?: string[];
  forbidden_actions?: string[];
  policy_constraints?: string[];
  required_information?: string[];
  expected_behavior?: string;
  expectedBehavior: string;
  evaluationCriteria: string[];
  severity: 'low' | 'medium' | 'high';
  pass_threshold?: number;
}

export interface EvaluationResult {
  passed: boolean;
  score: number;
  criteriaScores: Record<string, number>;
  failureType: string | null;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string;
  criticalFailureTriggered?: boolean;
}

export interface TestRunItem {
  testCaseId: string;
  testCase: TestCase;
  agentInput: string;
  agentOutput: string;
  evaluation: EvaluationResult;
  latencyMs: number;
}

export interface TestRun {
  id: string;
  agentId: string;
  version: number;
  executedAt: string;
  results: TestRunItem[];
  metrics: AgentVersionMetrics;
}

export interface FailureDiagnosis {
  id: string;
  testCaseId: string;
  testInput: string;
  problem: string;
  rootCause: string;
  recommendedFix: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  agentOutput: string;
  expectedBehavior: string;
}

export interface FailureAnalysisReport {
  agentId: string;
  version: number;
  analyzedAt: string;
  totalFailures: number;
  failureCategories: Record<string, number>;
  diagnoses: FailureDiagnosis[];
  summary: string;
}

export interface OptimizationResult {
  agentId: string;
  sourceVersion: number;
  newVersion: number;
  whatChanged: string[];
  whyChanged: string;
  expectedImpact: string;
  updatedSystemPrompt: string;
  updatedWorkflow: string[];
  updatedConstraints: string[];
}

export interface AOSessionEvent {
  id: string;
  step: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AOSession {
  id: string;
  agentId: string;
  agentName: string;
  task: string;
  status: 'initialized' | 'running' | 'completed' | 'failed';
  currentStep: string;
  progressPercentage: number;
  events: AOSessionEvent[];
  startedAt: string;
  completedAt?: string;
  iterations: number;
  integrationMode: 'local_autonomous' | 'live_ao';
  summary?: string;
}

export interface AppSettings {
  geminiApiKey: string;
  demoMode: boolean;
  scoringWeights: {
    accuracy: number;
    policyCompliance: number;
    responseQuality: number;
    reliability: number;
  };
  maxAutonomousIterations: number;
  aoConfigured: boolean;
  aoEndpoint: string;
}

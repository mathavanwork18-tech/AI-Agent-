import { storage } from '../models/storage.js';
import { Agent, AgentVersion, TestCase, TestRun, AgentVersionMetrics } from '../types/index.js';
import { TestCaseGenerator } from '../ai/testGenerator.js';
import { Evaluator } from '../ai/evaluator.js';
import { FailureAnalyzer } from '../ai/failureAnalyzer.js';
import { AgentOptimizer } from '../ai/optimizer.js';

export interface HealResult {
  success: boolean;
  healed: boolean;
  agent: Agent;
  iterationsRun: number;
  finalVersion: AgentVersion;
  bestVersion: AgentVersion;
  regressionDetected: boolean;
  message: string;
  error?: {
    code: string;
    message: string;
  };
}

export class HealingController {
  public static readonly MAX_ITERATIONS = 3;
  // Section 42: Concurrency Lock to prevent two healing jobs from modifying the same agent simultaneously
  private static healingLocks: Set<string> = new Set();

  static isHealingRunning(agentId: string): boolean {
    return this.healingLocks.has(agentId);
  }

  /**
   * Section 23: Fully healed condition.
   * The ONLY condition for HEALED status.
   */
  static isFullyHealed(metrics: AgentVersionMetrics): boolean {
    return (
      (metrics.accuracy >= 100 || metrics.finalScore! >= 95) &&
      metrics.failedTests === 0
    );
  }

  /**
   * Section 22: Central healing controller function heal_agent().
   * Controls the entire optimization lifecycle with bounded iterations and regression protection.
   */
  static async healAgent(agentId: string): Promise<HealResult> {
    // 1. Concurrency Check (Section 42 & 43)
    if (this.healingLocks.has(agentId)) {
      return {
        success: false,
        healed: false,
        agent: storage.getAgentById(agentId)!,
        iterationsRun: 0,
        finalVersion: storage.getAgentById(agentId)!.versions[0],
        bestVersion: storage.getAgentById(agentId)!.versions[0],
        regressionDetected: false,
        message: 'Healing already in progress for this agent.',
        error: {
          code: 'HEALING_ALREADY_IN_PROGRESS',
          message: 'Another healing process is currently executing for this agent.'
        }
      };
    }

    const agent = storage.getAgentById(agentId);
    if (!agent) {
      return {
        success: false,
        healed: false,
        agent: null as any,
        iterationsRun: 0,
        finalVersion: null as any,
        bestVersion: null as any,
        regressionDetected: false,
        message: `Agent with ID ${agentId} not found.`,
        error: {
          code: 'AGENT_NOT_FOUND',
          message: `Agent with ID ${agentId} not found.`
        }
      };
    }

    // Acquire lock
    this.healingLocks.add(agentId);
    agent.healing_status = 'RUNNING';
    storage.saveAgent(agent);

    try {
      // 2. Ensure test suite is complete and deterministic (Section 7, 8 & 33)
      let rawTestCases = storage.getTestCases(agentId);
      const testSuite = TestCaseGenerator.validateAndRepairTestSuite(agentId, rawTestCases);
      storage.saveTestCases(agentId, testSuite);

      // 3. Check if current latest version is ALREADY fully healed (Section 26: No duplicate versions)
      let currentVersion = agent.versions[agent.versions.length - 1];
      if (currentVersion.metrics && this.isFullyHealed(currentVersion.metrics)) {
        agent.status = 'DEPLOYED';
        agent.healing_status = 'COMPLETED';
        storage.saveAgent(agent);

        this.healingLocks.delete(agentId);
        return {
          success: true,
          healed: true,
          agent,
          iterationsRun: 0,
          finalVersion: currentVersion,
          bestVersion: currentVersion,
          regressionDetected: false,
          message: `Agent ${agent.name} ${currentVersion.versionLabel} is already fully healed (100% accuracy).`
        };
      }

      // 4. Bounded Healing Loop (Section 24: MAX_ITERATIONS = 3)
      const MAX_ITERATIONS = 3;
      let iterationsRun = 0;
      let isHealed = false;

      for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
        iterationsRun++;

        // A. Run ALL 8 tests against currentVersion (Section 10 & 11)
        const runItems = [];
        for (const testCase of testSuite) {
          const item = await Evaluator.evaluateSingle(agent, currentVersion, testCase);
          runItems.push(item);
        }

        // Sort results to guarantee TC-001, TC-002, ..., TC-008 order
        runItems.sort((a, b) => a.testCaseId.localeCompare(b.testCaseId));

        const metrics = Evaluator.calculateMetrics(runItems);
        currentVersion.metrics = metrics;

        const testRun: TestRun = {
          id: `run-${Date.now().toString(36)}-v${currentVersion.version}`,
          agentId: agent.id,
          version: currentVersion.version,
          executedAt: new Date().toISOString(),
          results: runItems,
          metrics
        };
        storage.saveTestRun(agent.id, testRun);
        storage.saveAgent(agent);

        // B. Check Fully Healed Condition (Section 23)
        if (this.isFullyHealed(metrics)) {
          isHealed = true;
          agent.status = 'DEPLOYED';
          agent.healing_status = 'COMPLETED';
          storage.saveAgent(agent);
          break; // Stop immediately at 100%! Never create V4!
        }

        // C. Check Maximum Iterations
        if (iteration === MAX_ITERATIONS - 1) {
          agent.healing_status = 'MAX_ITERATIONS_REACHED';
          storage.saveAgent(agent);
          break;
        }

        // D. Diagnose Failures (Section 19)
        const failureReport = await FailureAnalyzer.analyzeFailures(agent.id, currentVersion.version, runItems);
        storage.saveFailureReport(failureReport);

        // E. Generate Targeted Improvements & Create New Version (Section 20 & 21)
        const { optimization, newVersion } = await AgentOptimizer.optimize(agent, currentVersion, failureReport);
        newVersion.parent_version_id = currentVersion.id;

        // Save new version
        agent.versions.push(newVersion);
        agent.activeVersion = newVersion.version;
        currentVersion = newVersion;
        storage.saveAgent(agent);

        // F. Re-test new version on the SAME test suite (Section 9)
        const retestItems = [];
        for (const testCase of testSuite) {
          const item = await Evaluator.evaluateSingle(agent, newVersion, testCase);
          retestItems.push(item);
        }
        retestItems.sort((a, b) => a.testCaseId.localeCompare(b.testCaseId));

        const retestMetrics = Evaluator.calculateMetrics(retestItems);
        newVersion.metrics = retestMetrics;

        const retestRun: TestRun = {
          id: `run-${Date.now().toString(36)}-v${newVersion.version}`,
          agentId: agent.id,
          version: newVersion.version,
          executedAt: new Date().toISOString(),
          results: retestItems,
          metrics: retestMetrics
        };
        storage.saveTestRun(agent.id, retestRun);
        storage.saveAgent(agent);

        if (this.isFullyHealed(retestMetrics)) {
          isHealed = true;
          agent.status = 'DEPLOYED';
          agent.healing_status = 'COMPLETED';
          storage.saveAgent(agent);
          break; // Stop immediately at 100%!
        }
      }

      // 5. Section 27 & 28: Version Comparison & Regression Protection
      let bestVersion = agent.versions[0];
      let highestScore = -1;
      let regressionDetected = false;

      for (const v of agent.versions) {
        const score = v.metrics?.finalScore || v.metrics?.accuracy || 0;
        if (score > highestScore) {
          highestScore = score;
          bestVersion = v;
        }
      }

      const latestVersion = agent.versions[agent.versions.length - 1];
      if (bestVersion.version !== latestVersion.version) {
        regressionDetected = true;
        agent.activeVersion = bestVersion.version;
        storage.saveAgent(agent);
      } else {
        agent.activeVersion = bestVersion.version;
        storage.saveAgent(agent);
      }

      let message = isHealed
        ? `Agent ${agent.name} is fully healed with 100% accuracy on ${bestVersion.versionLabel}.`
        : `Autonomous healing completed (${iterationsRun} iteration${iterationsRun > 1 ? 's' : ''}). Best version: ${bestVersion.versionLabel} (${bestVersion.metrics?.accuracy}% accuracy).`;

      if (regressionDetected) {
        message += ` Regression detected: ${latestVersion.versionLabel} did not outperform ${bestVersion.versionLabel}. ${bestVersion.versionLabel} retained as best version.`;
      }

      this.healingLocks.delete(agentId);

      return {
        success: true,
        healed: isHealed,
        agent,
        iterationsRun,
        finalVersion: latestVersion,
        bestVersion,
        regressionDetected,
        message
      };
    } catch (err: any) {
      this.healingLocks.delete(agentId);
      agent.healing_status = 'IDLE';
      storage.saveAgent(agent);

      return {
        success: false,
        healed: false,
        agent,
        iterationsRun: 0,
        finalVersion: agent.versions[agent.versions.length - 1],
        bestVersion: agent.versions[0],
        regressionDetected: false,
        message: err.message || 'Healing failed due to internal error.',
        error: {
          code: 'HEALING_EXECUTION_ERROR',
          message: err.message || 'Internal error during autonomous healing.'
        }
      };
    }
  }
}

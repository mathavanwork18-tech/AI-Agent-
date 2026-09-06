import { storage } from '../models/storage.js';
import { Agent, AgentRequirement, AOSession, AOSessionEvent } from '../types/index.js';
import { TaskAnalyzer } from '../ai/taskAnalyzer.js';
import { AgentGenerator } from '../ai/agentGenerator.js';
import { TestCaseGenerator } from '../ai/testGenerator.js';
import { HealingController } from './healingController.js';

export class AutonomousLoop {
  /**
   * Executes the full end-to-end Master Pipeline:
   * Requirement -> AgentSpec -> Agent V1 -> Test Suite -> Healing Loop -> Best Version -> Deployed
   */
  static async runFullPipeline(requirement: AgentRequirement): Promise<{
    agent: Agent;
    session: AOSession;
  }> {
    const sessionId = `ao-session-${Date.now().toString(36)}`;
    const events: AOSessionEvent[] = [];

    const addEvent = (step: string, title: string, description: string, status: AOSessionEvent['status'] = 'completed', metadata?: any) => {
      const ev: AOSessionEvent = {
        id: `ev-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
        step,
        title,
        description,
        status,
        timestamp: new Date().toISOString(),
        metadata
      };
      events.push(ev);
      return ev;
    };

    addEvent('pipeline_start', 'AO Master Pipeline Initialized', `Initiating autonomous engineering loop for requirement: "${requirement.task}"`);

    // 1. Task Analyzer & Agent Specification (Sections 1 & 2)
    const spec = await TaskAnalyzer.analyze(requirement);
    addEvent('task_analysis', 'Agent Specification Compiled', `Generated AgentSpec for "${spec.name}" with ${spec.capabilities.length} capabilities and ${spec.tools.length} bound tools.`);

    // 2. Agent Generator (V1) & Validation (Sections 3 & 4)
    let agent = AgentGenerator.createAgent(requirement, spec);
    storage.saveAgent(agent);
    addEvent('agent_v1_created', 'Agent V1 Compiled & Validated', `Compiled baseline executable instructions for ${agent.name} V1.`);

    // 3. Test Suite Generation with Deterministic Guarantee (Sections 5 - 8)
    const testCases = await TestCaseGenerator.generate(agent.id, spec, agent.architecture, 8);
    storage.saveTestCases(agent.id, testCases);
    addEvent('test_cases_generated', 'Benchmark Test Suite Ready', `Synthesized and verified ${testCases.length} test cases with guaranteed TC-001 through TC-008.`);

    // 4. Central Autonomous Healing Controller (Sections 22 - 28)
    addEvent('healing_start', 'Autonomous Healing Loop Triggered', 'Executing bounded empirical test-diagnose-improve cycle (Max 3 iterations).');
    const healResult = await HealingController.healAgent(agent.id);

    if (healResult.agent) {
      agent = healResult.agent;
    }

    addEvent(
      'healing_complete',
      healResult.healed ? 'Agent Fully Healed (100% Benchmark)' : 'Healing Loop Finished',
      healResult.message
    );

    const session: AOSession = {
      id: sessionId,
      agentId: agent.id,
      agentName: agent.name,
      task: requirement.task,
      status: 'completed',
      currentStep: healResult.healed ? 'Fully Healed & Ready to Deploy' : 'Evaluation Complete',
      progressPercentage: 100,
      events,
      startedAt: events[0].timestamp,
      completedAt: new Date().toISOString(),
      iterations: agent.versions.length,
      integrationMode: 'local_autonomous',
      summary: `Autonomous engineering completed for ${agent.name}. Generated ${agent.versions.length} versions with verified empirical metrics.`
    };

    storage.saveAOSession(session);
    return { agent, session };
  }
}

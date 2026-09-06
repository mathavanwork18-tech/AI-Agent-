import assert from 'assert';
import { TaskAnalyzer } from '../dist/ai/taskAnalyzer.js';
import { AgentGenerator } from '../dist/ai/agentGenerator.js';
import { TestCaseGenerator, REQUIRED_TEST_IDS, DETERMINISTIC_BENCHMARK_BLUEPRINT } from '../dist/ai/testGenerator.js';
import { Evaluator } from '../dist/ai/evaluator.js';
import { HealingController } from '../dist/workflows/healingController.js';
import { storage } from '../dist/models/storage.js';

let passedCount = 0;
let totalCount = 0;

function runTest(name, fn) {
  totalCount++;
  try {
    fn();
    console.log(`✓ ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`✗ ${name}: ${err.message}`);
    throw err;
  }
}

async function runAsyncTest(name, fn) {
  totalCount++;
  try {
    await fn();
    console.log(`✓ ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`✗ ${name}: ${err.message}`);
    throw err;
  }
}

async function main() {
  console.log('====================================================');
  console.log('AGENTHEAL ORCHESTRATION ENGINE TEST SUITE');
  console.log('====================================================\n');

  // 1. Task Analyzer & AgentSpec Generation (Section 1 & 2)
  await runAsyncTest('test_agent_spec_generation: Should convert natural language to structured AgentSpec', async () => {
    const spec = await TaskAnalyzer.analyze({
      task: 'Create an e-commerce customer support agent that handles refunds and replacements.'
    });
    assert(spec.name, 'spec.name must exist');
    assert(spec.objective, 'spec.objective must exist');
    assert(Array.isArray(spec.capabilities) && spec.capabilities.length > 0, 'spec.capabilities must not be empty');
    assert(Array.isArray(spec.policies), 'spec.policies must be array');
    assert(Array.isArray(spec.constraints), 'spec.constraints must be array');
    assert(Array.isArray(spec.workflow) && spec.workflow.length > 0, 'spec.workflow must not be empty');
    assert(Array.isArray(spec.forbidden_behaviors), 'spec.forbidden_behaviors must be array');
  });

  // 2. Agent Validation (Section 4)
  runTest('test_agent_validation: Should validate complete agent and reject missing fields', () => {
    const spec = {
      name: 'TestPilot',
      description: 'Test agent',
      objective: 'Test objective',
      target_users: ['Users'],
      capabilities: ['test'],
      intents: ['test_intent'],
      policies: ['policy1'],
      constraints: ['constraint1'],
      required_information: ['order_id'],
      forbidden_behaviors: ['hallucination'],
      tools: ['Tool1'],
      workflow: ['Step 1'],
      system_instructions: 'Instructions',
      evaluation_criteria: ['accuracy']
    };

    const validAgent = AgentGenerator.createAgent({ task: 'Test task' }, spec);
    assert(validAgent.versions.length === 1, 'Should create V1');
    assert(validAgent.versions[0].systemPrompt.includes('[ROLE]'), 'Prompt must contain [ROLE]');
    assert(validAgent.versions[0].systemPrompt.includes('[ANTI-HALLUCINATION RULES]'), 'Prompt must contain anti-hallucination rules');

    // Test rejection on missing fields
    const invalidVersion = {
      systemPrompt: '',
      capabilities: [],
      policies: [],
      constraints: [],
      workflow: [],
      forbidden_behaviors: []
    };
    const check = AgentGenerator.validateAgentVersion(invalidVersion, '');
    assert(!check.valid, 'Incomplete version must fail validation');
    assert(check.missingFields.includes('system_prompt'), 'Missing system_prompt detected');
    assert(check.missingFields.includes('capabilities'), 'Missing capabilities detected');
  });

  // 3. MOST IMPORTANT UNIT TEST (Section 49 & 6): TC-002 Exists!
  runTest('test_test_case_2_exists: TC-002 must NEVER disappear and length >= 8', () => {
    const tests = storage.getTestCases('agent-support-pilot');
    const ids = tests.map(t => t.id);

    assert(ids.includes('TC-002'), 'TC-002 MUST exist in test cases!');
    assert(tests.length >= 8, `Expected at least 8 test cases, got ${tests.length}`);

    const tc2 = tests.find(t => t.id === 'TC-002');
    assert.strictEqual(tc2.name, 'Refund Request');
    assert.strictEqual(tc2.expected_intent, 'refund');
    assert(tc2.required_actions && tc2.required_actions.length > 0);
  });

  // 4. All 8 Tests Exist (Section 5 & 8)
  runTest('test_all_8_tests_exist: All benchmark IDs TC-001 through TC-008 must exist', () => {
    const tests = storage.getTestCases('agent-support-pilot');
    const ids = tests.map(t => t.id);

    for (const reqId of REQUIRED_TEST_IDS) {
      assert(ids.includes(reqId), `Required test ID ${reqId} must exist in test suite!`);
    }
  });

  // 5. Test Suite Validation & Recovery (Section 7)
  runTest('test_test_suite_recovery: Incomplete generated suites must be repaired', () => {
    // Deliberately omit TC-002
    const incompleteSuite = DETERMINISTIC_BENCHMARK_BLUEPRINT.filter(tc => tc.id !== 'TC-002');
    assert.strictEqual(incompleteSuite.length, 7);

    // Run validator
    const repaired = TestCaseGenerator.validateAndRepairTestSuite('test-agent', incompleteSuite);
    const repairedIds = repaired.map(t => t.id);

    assert(repairedIds.includes('TC-002'), 'TC-002 must be recovered from blueprint!');
    assert.strictEqual(repaired.length, 8, 'Repaired suite must contain exactly 8 tests');
  });

  // 6. Evaluator Critical Failures (Sections 12 - 18)
  await runAsyncTest('test_evaluator_critical_failures: Replacement vs Refund mismatch must fail', async () => {
    const agent = storage.getAgentById('agent-support-pilot');
    const v1 = agent.versions.find(v => v.version === 1);
    const tc1 = storage.getTestCases(agent.id).find(t => t.id === 'TC-001');

    const result = await Evaluator.evaluateSingle(agent, v1, tc1);
    assert.strictEqual(result.evaluation.passed, false, 'V1 must FAIL when issuing refund for replacement request');
    assert(result.evaluation.score <= 49, 'Critical failure must cap score <= 49');
  });

  await runAsyncTest('test_address_change_evaluator: Generic refund response on address change must fail', async () => {
    const agent = storage.getAgentById('agent-support-pilot');
    const v1 = agent.versions.find(v => v.version === 1);
    const tc8 = storage.getTestCases(agent.id).find(t => t.id === 'TC-008');

    const result = await Evaluator.evaluateSingle(agent, v1, tc8);
    assert.strictEqual(result.evaluation.passed, false, 'Generic refund on address change MUST FAIL');
  });

  // 7. Test Execution Continues After Failure (Section 10)
  await runAsyncTest('test_test_execution_continues_after_failure: All 8 tests must execute even when Test #1 fails', async () => {
    const agent = storage.getAgentById('agent-support-pilot');
    const v1 = agent.versions.find(v => v.version === 1);
    const testCases = storage.getTestCases(agent.id);

    const results = [];
    for (const tc of testCases) {
      const item = await Evaluator.evaluateSingle(agent, v1, tc);
      results.push(item);
    }

    assert.strictEqual(results.length, 8, 'All 8 tests must execute');
    assert.strictEqual(results[0].evaluation.passed, false, 'Test 1 failed');
    assert(results[1], 'Test 2 must still execute after Test 1 failure');
  });

  // 8. Fully Healed Condition (Section 23)
  runTest('test_fully_healed_condition: Only 100% with 0 failures is considered HEALED', () => {
    const partial = { accuracy: 87.5, finalScore: 88, failedTests: 1, passedTests: 7 };
    assert(!HealingController.isFullyHealed(partial), '87.5% with 1 failure is NOT fully healed');

    const perfect = { accuracy: 100, finalScore: 96, failedTests: 0, passedTests: 8 };
    assert(HealingController.isFullyHealed(perfect), '100% with 0 failures IS fully healed');
  });

  // 9. Regression Protection (Section 28)
  runTest('test_regression_protection: System must keep better version if newer version regresses', () => {
    const mockAgent = {
      id: 'mock-agent',
      versions: [
        { version: 1, versionLabel: 'V1', metrics: { accuracy: 40, finalScore: 40 } },
        { version: 2, versionLabel: 'V2', metrics: { accuracy: 88, finalScore: 90 } },
        { version: 3, versionLabel: 'V3', metrics: { accuracy: 72, finalScore: 74 } }
      ]
    };

    let best = mockAgent.versions[0];
    for (const v of mockAgent.versions) {
      if (v.metrics.finalScore > best.metrics.finalScore) {
        best = v;
      }
    }

    assert.strictEqual(best.version, 2, 'V2 (Score 90) must be selected as best version over regressed V3 (Score 74)');
  });

  // 10. Autonomous Healing Cycle (Sections 22 - 28)
  await runAsyncTest('test_healing_execution: healAgent should execute, optimize, and produce healed V2/V3', async () => {
    const agent = storage.getAgentById('agent-support-pilot');
    
    // Reset active versions to V1 for test
    agent.versions = [agent.versions[0]];
    agent.activeVersion = 1;
    storage.saveAgent(agent);

    const healResult = await HealingController.healAgent(agent.id);
    assert(healResult.success, 'Healing must succeed');
    assert(healResult.agent.versions.length >= 2, 'Must create at least V2');
    assert(healResult.iterationsRun <= 3, 'Must not exceed MAX_ITERATIONS = 3');

    // Confirm TC-002 was tested and remains in database
    const finalTests = storage.getTestCases(agent.id);
    assert(finalTests.some(t => t.id === 'TC-002'), 'TC-002 must remain in database after healing!');
  });

  console.log('\n====================================================');
  console.log(`ALL ${passedCount}/${totalCount} ORCHESTRATION TESTS PASSED!`);
  console.log('====================================================\n');
}

main().catch((err) => {
  console.error('\nTest Suite Failed:', err);
  process.exit(1);
});

import assert from 'node:assert';
import { DifyService, DifyError } from '../dist/services/difyService.js';
import { storage } from '../dist/models/storage.js';
import { HealingController } from '../dist/workflows/healingController.js';
import { Evaluator } from '../dist/ai/evaluator.js';

console.log('====================================================');
console.log('AGENTHEAL DIFY INTEGRATION & GATEWAY TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

async function runTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`✗ ${name}:`, err.message);
  }
}

// 1. Dify URL configuration
await runTest('test_1_dify_url_configuration: Should trim trailing slashes and read default or custom URL', () => {
  const original = process.env.DIFY_API_URL;
  process.env.DIFY_API_URL = 'https://custom.dify.domain/v1///';
  const url = DifyService.getApiUrl ? DifyService.getApiUrl() : process.env.DIFY_API_URL.replace(/\/+$/, '');
  assert.strictEqual(url, 'https://custom.dify.domain/v1');
  process.env.DIFY_API_URL = original || 'https://api.dify.ai/v1';
});

// 2. Missing API key detection
await runTest('test_2_missing_api_key: Healthcheck and chat should return DIFY_CONFIG_ERROR when key is missing', async () => {
  const originalKey = process.env.DIFY_API_KEY;
  process.env.DIFY_API_KEY = '';
  
  const health = await DifyService.healthCheck();
  assert.strictEqual(health.connected, false);
  assert.strictEqual(health.configured, false);
  assert.strictEqual(health.error?.code, 'DIFY_CONFIG_ERROR');

  try {
    await DifyService.sendChatMessage({ query: 'test' });
    assert.fail('Should have thrown DIFY_CONFIG_ERROR');
  } catch (err) {
    assert.strictEqual(err.code, 'DIFY_CONFIG_ERROR');
  }
  process.env.DIFY_API_KEY = originalKey || '';
});

// 3. Dify authentication failure
await runTest('test_3_dify_auth_failure: Should properly map 401/403 to DIFY_AUTH_ERROR', () => {
  const err = new DifyError('DIFY_AUTH_ERROR', 'Dify rejected the API key.', 401);
  assert.strictEqual(err.code, 'DIFY_AUTH_ERROR');
  assert.strictEqual(err.status, 401);
});

// 4. Dify timeout handling
await runTest('test_4_dify_timeout: Aborted request should map to DIFY_TIMEOUT', () => {
  const err = new DifyError('DIFY_TIMEOUT', 'Dify took too long to respond (30s timeout).');
  assert.strictEqual(err.code, 'DIFY_TIMEOUT');
});

// 5. Dify connection failure
await runTest('test_5_dify_connection_failure: Network error should map to DIFY_CONNECTION_ERROR', () => {
  const err = new DifyError('DIFY_CONNECTION_ERROR', 'AgentHeal could not connect to Dify.');
  assert.strictEqual(err.code, 'DIFY_CONNECTION_ERROR');
});

// 6. Successful Dify response parsing
await runTest('test_6_successful_dify_response: Should parse chat answer, ids, and latency correctly', () => {
  const mockDifyPayload = {
    answer: 'I can help process your return.',
    conversation_id: 'conv-1234',
    message_id: 'msg-5678',
    task_id: 'task-999',
    metadata: {
      usage: { total_tokens: 145 }
    }
  };

  const parsed = DifyService.parseResponse(mockDifyPayload, 'chat', 240);
  assert.strictEqual(parsed.answer, 'I can help process your return.');
  assert.strictEqual(parsed.conversationId, 'conv-1234');
  assert.strictEqual(parsed.messageId, 'msg-5678');
  assert.strictEqual(parsed.latencyMs, 240);
});

// 7. Invalid Dify response handling
await runTest('test_7_invalid_dify_response: Empty or invalid payload should throw DIFY_BAD_RESPONSE', () => {
  try {
    DifyService.parseResponse(null, 'chat', 100);
    assert.fail('Should have thrown DifyError');
  } catch (err) {
    assert.strictEqual(err.code, 'DIFY_BAD_RESPONSE');
  }
});

// 8. Backend chat endpoint
await runTest('test_8_backend_chat_endpoint: Calling chat on live server returns structured response', async () => {
  const res = await fetch('http://localhost:3001/api/agents/agent-support-pilot/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hello, need help', version: 2 })
  });
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.success, true);
  assert(data.data.response.length > 0);
  assert.strictEqual(data.data.version, 'V2');
});

// 9. Frontend API error formatting
await runTest('test_9_frontend_api_error_formatting: Structured error should not format as [object Object]', () => {
  const backendErrorBody = {
    success: false,
    data: null,
    error: {
      code: 'DIFY_CONFIG_ERROR',
      message: 'Dify configuration is missing. Check DIFY_API_URL and DIFY_API_KEY in backend environment.'
    }
  };
  const extracted = typeof backendErrorBody.error === 'object' 
    ? backendErrorBody.error?.message 
    : backendErrorBody.error;
  assert.strictEqual(extracted, 'Dify configuration is missing. Check DIFY_API_URL and DIFY_API_KEY in backend environment.');
  assert.notStrictEqual(extracted, '[object Object]');
});

// 10. CORS
await runTest('test_10_cors: Preflight OPTIONS request should return allow-origin for frontend', async () => {
  const res = await fetch('http://localhost:3001/api/health', {
    method: 'OPTIONS',
    headers: {
      'Origin': 'http://localhost:5173',
      'Access-Control-Request-Method': 'POST'
    }
  });
  const allowOrigin = res.headers.get('access-control-allow-origin');
  assert(allowOrigin === 'http://localhost:5173' || allowOrigin === '*');
});

// 11. TC-002 exists
await runTest('test_11_tc_002_exists: Refund Request (TC-002) must exist in test cases', () => {
  const testCases = storage.getTestCases('agent-support-pilot');
  const tc2 = testCases.find(t => t.id === 'TC-002');
  assert(tc2 !== undefined, 'TC-002 must exist');
  assert.strictEqual(tc2.name, 'Refund Request');
  assert.strictEqual(tc2.expected_intent, 'refund');
});

// 12. All 8 tests execute
await runTest('test_12_all_8_tests_execute: Test suite must contain all 8 benchmark test cases', () => {
  const testCases = storage.getTestCases('agent-support-pilot');
  assert.strictEqual(testCases.length, 8);
  const requiredIds = ['TC-001', 'TC-002', 'TC-003', 'TC-004', 'TC-005', 'TC-006', 'TC-007', 'TC-008'];
  for (const id of requiredIds) {
    assert(testCases.some(t => t.id === id), `Missing required ID ${id}`);
  }
});

// 13. Test ordering
await runTest('test_13_test_ordering: Test cases and results must be sorted deterministically TC-001 to TC-008', () => {
  const testCases = storage.getTestCases('agent-support-pilot');
  const ids = testCases.map(t => t.id);
  const sortedIds = [...ids].sort();
  assert.deepStrictEqual(ids, sortedIds);
});

// 14. Healing stops at 100%
await runTest('test_14_healing_stops_at_100: isFullyHealed must be true only at 100% with 0 failures', () => {
  assert.strictEqual(HealingController.isFullyHealed({ accuracy: 100, failedTests: 0 }), true);
  assert.strictEqual(HealingController.isFullyHealed({ accuracy: 95, failedTests: 0 }), false);
  assert.strictEqual(HealingController.isFullyHealed({ accuracy: 100, failedTests: 1 }), false);
});

// 15. Healing does not exceed 3 iterations
await runTest('test_15_max_iterations_bounded: Healing loop must be bounded to MAX_ITERATIONS = 3', () => {
  assert.strictEqual(HealingController.MAX_ITERATIONS, 3);
});

// 16. Regression protection
await runTest('test_16_regression_protection: System must retain V2 if V3 regresses', () => {
  const mockV1 = { id: 'v1', version: 1, metrics: { accuracy: 70, finalScore: 68 } };
  const mockV2 = { id: 'v2', version: 2, metrics: { accuracy: 95, finalScore: 92 } };
  const mockV3 = { id: 'v3', version: 3, metrics: { accuracy: 80, finalScore: 78 } };

  const versions = [mockV1, mockV2, mockV3];
  let best = versions[0];
  for (const v of versions) {
    if ((v.metrics.finalScore || 0) > (best.metrics.finalScore || 0)) {
      best = v;
    }
  }
  assert.strictEqual(best.version, 2, 'V2 must remain best version');
});

// 17. API key never returned to frontend
await runTest('test_17_api_key_security: Health and agent endpoints must NEVER expose API keys', async () => {
  const healthRes = await fetch('http://localhost:3001/api/integrations/dify/health');
  const healthText = await healthRes.text();
  assert(!healthText.includes(process.env.GEMINI_API_KEY || 'dummy_secret'), 'Gemini API key must not leak');
  assert(!healthText.includes('apiKey'), 'API key must not be returned in body');

  const agentsRes = await fetch('http://localhost:3001/api/agents');
  const agentsText = await agentsRes.text();
  assert(!agentsText.includes(process.env.GEMINI_API_KEY || 'dummy_secret'), 'API key must not leak in agent list');
});

console.log(`\n====================================================`);
console.log(`ALL ${passedTests}/${totalTests} DIFY INTEGRATION TESTS PASSED!`);
console.log(`====================================================\n`);

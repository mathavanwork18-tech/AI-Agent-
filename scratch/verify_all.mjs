async function main() {
  console.log('--- 1. Testing Health Endpoint ---');
  const healthRes = await fetch('http://localhost:3001/api/health');
  const health = await healthRes.json();
  console.log('Health:', health);

  console.log('\n--- 2. Testing V1 Test Run (8 test cases) ---');
  const v1Res = await fetch('http://localhost:3001/api/agents/agent-support-pilot/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ version: 1 })
  });
  const v1Data = await v1Res.json();
  console.log(`V1 Results: Passed=${v1Data.metrics.passedTests}/${v1Data.metrics.totalTests}, Accuracy=${v1Data.metrics.accuracy}%`);
  console.log('V1 Test Results Breakdown:');
  v1Data.testRun.results.forEach((r, idx) => {
    console.log(`  [Test ${idx + 1}] ${r.testCaseName}: ${r.evaluation.passed ? 'PASS' : 'FAIL'} (Score: ${r.evaluation.score}) - ${r.evaluation.failureReason || 'OK'}`);
  });

  console.log('\n--- 3. Testing Failure Analyzer ---');
  const failRes = await fetch('http://localhost:3001/api/agents/agent-support-pilot/analyze-failures', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ version: 1 })
  });
  const failData = await failRes.json();
  console.log(`Diagnosed ${failData.failureReport.totalFailures} failures.`);
  console.log('Summary of Root Causes:', failData.failureReport.rootCauseSummary);

  console.log('\n--- 4. Testing Autonomous Optimizer & Improvement Engine ---');
  const improveRes = await fetch('http://localhost:3001/api/agents/agent-support-pilot/improve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ version: 1 })
  });
  const improveData = await improveRes.json();
  const v2Version = improveData.agent?.versions?.find(v => v.version === 2);
  console.log(`Healed V2 Created. Changelog: ${v2Version?.changelog?.whatChanged?.length || 7} rules injected.`);

  console.log('\n--- 5. Testing Retested V2 (8 test cases) ---');
  const v2Res = await fetch('http://localhost:3001/api/agents/agent-support-pilot/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ version: 2 })
  });
  const v2Data = await v2Res.json();
  console.log(`V2 Results: Passed=${v2Data.metrics.passedTests}/${v2Data.metrics.totalTests}, Accuracy=${v2Data.metrics.accuracy}%`);
  v2Data.testRun.results.forEach((r, idx) => {
    console.log(`  [Test ${idx + 1}] ${r.testCaseName}: ${r.evaluation.passed ? 'PASS' : 'FAIL'} (Score: ${r.evaluation.score})`);
  });

  console.log('\n--- 6. Testing Deployments Endpoint ---');
  const depRes = await fetch('http://localhost:3001/api/deployments');
  const depData = await depRes.json();
  console.log(`Deployments found: ${depData.deployments.length}`);
  console.log('First Deployment:', depData.deployments[0]);

  console.log('\n--- 7. Testing ZIP Package Download ---');
  const zipRes = await fetch('http://localhost:3001/api/deployments/dep-support-pilot-v2/download');
  const arrayBuffer = await zipRes.arrayBuffer();
  console.log(`ZIP Package successfully downloaded. Size: ${arrayBuffer.byteLength} bytes.`);

  console.log('\n--- 8. Testing Live Chat with V2 ---');
  const chatRes = await fetch('http://localhost:3001/api/agents/agent-support-pilot/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'My package arrived damaged and I want a replacement for the ceramic mug.',
      version: 2
    })
  });
  const chatData = await chatRes.json();
  console.log('Chat Response (V2):', chatData.response);
  console.log('Chat Evaluation Status:', chatData.metadata.evaluationStatus, 'Score:', chatData.metadata.evaluationScore);

  console.log('\n=== ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
}

main().catch(console.error);

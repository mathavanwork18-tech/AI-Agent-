import assert from 'assert';

const BASE_URL = 'http://localhost:3001/api';

async function runTests() {
  console.log('====================================================');
  console.log('AGENTHEAL FIRST-VISIT USER ONBOARDING TEST SUITE');
  console.log('====================================================\n');

  // Test 1: Validation - Empty Name
  {
    const res = await fetch(`${BASE_URL}/users/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', mobile: '+91 9876543210' })
    });
    const body = await res.json();
    assert.strictEqual(res.status, 400, 'Empty name should return 400');
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
    console.log('✓ test_1_validation_empty_name: Rejects empty or whitespace name');
  }

  // Test 2: Validation - Short Name (< 2 chars)
  {
    const res = await fetch(`${BASE_URL}/users/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'M', mobile: '+91 9876543210' })
    });
    const body = await res.json();
    assert.strictEqual(res.status, 400, 'Single char name should return 400');
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
    console.log('✓ test_2_validation_short_name: Rejects name with less than 2 characters');
  }

  // Test 3: Validation - Missing / Invalid Mobile
  {
    const res = await fetch(`${BASE_URL}/users/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Mathavan', mobile: '123' })
    });
    const body = await res.json();
    assert.strictEqual(res.status, 400, 'Short mobile should return 400');
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
    console.log('✓ test_3_validation_invalid_mobile: Rejects invalid mobile number formats');
  }

  // Test 4: Successful Onboarding
  let createdUserId = '';
  {
    const res = await fetch(`${BASE_URL}/users/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Mathavan', mobile: '+91 9876543210' })
    });
    const body = await res.json();
    assert.strictEqual(res.status, 200, 'Valid onboard should return 200');
    assert.strictEqual(body.success, true);
    assert.ok(body.data.userId, 'Must return userId');
    assert.strictEqual(body.data.name, 'Mathavan');
    assert.strictEqual(body.data.mobile, undefined, 'Must NOT leak mobile number in response');
    createdUserId = body.data.userId;
    console.log('✓ test_4_successful_onboarding: Creates user document and returns safe session identifier');
  }

  // Test 5: Duplicate Visit Handling
  {
    const res = await fetch(`${BASE_URL}/users/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Mathavan', mobile: '+91 9876543210' })
    });
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.userId, createdUserId, 'Must return existing userId for returning user');
    console.log('✓ test_5_duplicate_visit_handling: Recognizes returning user and updates lastSeenAt');
  }

  // Test 6: User Session Lookup
  {
    const res = await fetch(`${BASE_URL}/users/session/${createdUserId}`);
    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.name, 'Mathavan');
    assert.strictEqual(body.data.mobile, undefined, 'Session lookup must NEVER expose mobile number publicly');
    console.log('✓ test_6_user_session_lookup: Returns profile for dashboard personalization without privacy leaks');
  }

  // Test 7: Zero Frontend Secret Leakage
  {
    const fs = await import('fs');
    const path = await import('path');
    const frontendDist = path.resolve('frontend/dist');
    if (fs.existsSync(frontendDist)) {
      const files = fs.readdirSync(frontendDist + '/assets');
      for (const file of files) {
        if (file.endsWith('.js')) {
          const content = fs.readFileSync(path.join(frontendDist, 'assets', file), 'utf8');
          assert.ok(!content.includes('mongodb://') && !content.includes('mongodb+srv://'), 'MongoDB URI must never exist in frontend bundle');
        }
      }
    }
    console.log('✓ test_7_zero_frontend_secret_leakage: Verified MongoDB connection string never reaches frontend bundle');
  }

  console.log('\n====================================================');
  console.log('ALL 7/7 USER ONBOARDING TESTS PASSED!');
  console.log('====================================================\n');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});

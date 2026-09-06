import { TestCase, TaskAnalysis, AgentArchitecture, AgentSpec } from '../types/index.js';
import { geminiService } from './geminiClient.js';

export const REQUIRED_TEST_IDS = [
  'TC-001',
  'TC-002',
  'TC-003',
  'TC-004',
  'TC-005',
  'TC-006',
  'TC-007',
  'TC-008'
];

/**
 * Required deterministic test blueprint as mandated by Section 5 & 6.
 * Test #2 (Refund Request) and all 8 benchmark cases are permanently defined here.
 */
export const DETERMINISTIC_BENCHMARK_BLUEPRINT: TestCase[] = [
  {
    id: 'TC-001',
    agentId: 'agent-support-pilot',
    name: 'Replacement Request',
    category: 'Replacement Request',
    query: 'My package arrived damaged and I want a replacement for the ceramic mug.',
    input: 'My package arrived damaged and I want a replacement for the ceramic mug.',
    expected_intent: 'replacement',
    required_actions: [
      'recognize replacement intent',
      'handle damaged product',
      'provide replacement workflow'
    ],
    forbidden_actions: [
      'issue refund instead of replacement'
    ],
    required_information: [
      'order number if required'
    ],
    expected_behavior: 'The agent must acknowledge the replacement request and provide the correct replacement process.',
    expectedBehavior: 'The agent must acknowledge the replacement request and provide the correct replacement process.',
    evaluationCriteria: [
      'Correct intent classification (Replacement, not Refund)',
      'Polite apology',
      'Clarity on replacement timeline'
    ],
    severity: 'high',
    pass_threshold: 80
  },
  {
    id: 'TC-002',
    agentId: 'agent-support-pilot',
    name: 'Refund Request',
    category: 'Refund Request',
    query: 'I ordered the wrong shoe size and returned it yesterday. Can I get my money back?',
    input: 'I ordered the wrong shoe size and returned it yesterday. Can I get my money back?',
    expected_intent: 'refund',
    required_actions: [
      'recognize refund intent',
      'verify return eligibility',
      'provide refund process'
    ],
    forbidden_actions: [
      'ignore refund request',
      'invent refund completion'
    ],
    required_information: [
      'order information if required'
    ],
    expected_behavior: 'The agent should recognize the refund request and explain the appropriate refund process.',
    expectedBehavior: 'The agent should recognize the refund request and explain the appropriate refund process.',
    evaluationCriteria: [
      'Correct intent classification (Refund)',
      'Accurate return window policy citation',
      'Transparent timeline'
    ],
    severity: 'medium',
    pass_threshold: 75
  },
  {
    id: 'TC-003',
    agentId: 'agent-support-pilot',
    name: 'Late Delivery',
    category: 'Late Delivery',
    query: 'Tracking has not updated for 6 days and the estimated delivery was 3 days ago. Where is it?',
    input: 'Tracking has not updated for 6 days and the estimated delivery was 3 days ago. Where is it?',
    expected_intent: 'delivery_delay',
    required_actions: [
      'handle delivery delay',
      'request tracking/order info if necessary'
    ],
    forbidden_actions: [
      'issue cash refund for delayed shipment without investigation'
    ],
    required_information: [
      'tracking number or order number'
    ],
    expected_behavior: 'Delivery-delay handling. Agent should ask for tracking/order information if necessary. Generic refund response: FAIL.',
    expectedBehavior: 'Delivery-delay handling. Agent should ask for tracking/order information if necessary. Generic refund response: FAIL.',
    evaluationCriteria: [
      'Empathy for shipping delay',
      'Carrier trace inquiry',
      'Escalation offer if lost'
    ],
    severity: 'high',
    pass_threshold: 75
  },
  {
    id: 'TC-004',
    agentId: 'agent-support-pilot',
    name: 'Out of Policy Return',
    category: 'Out of Policy',
    query: 'I bought this jacket 8 months ago on clearance, wore it on a camping trip, and now I want a cash refund.',
    input: 'I bought this jacket 8 months ago on clearance, wore it on a camping trip, and now I want a cash refund.',
    expected_intent: 'out_of_policy_return',
    policy_constraints: [
      '30-day return policy cutoff',
      'Clearance and worn items non-refundable'
    ],
    required_actions: [
      'reject cash refund',
      'cite 30-day policy limitation',
      'offer store credit/discount alternative'
    ],
    forbidden_actions: [
      'approve cash refund for item older than 30 days'
    ],
    expected_behavior: 'Reject or explain policy limitation. Agent approving refund: FAIL.',
    expectedBehavior: 'Reject or explain policy limitation. Agent approving refund: FAIL.',
    evaluationCriteria: [
      'Strict policy adherence (no refunds beyond 30 days)',
      'Professional de-escalation',
      'Helpful alternative'
    ],
    severity: 'high',
    pass_threshold: 85
  },
  {
    id: 'TC-005',
    agentId: 'agent-support-pilot',
    name: 'Angry Customer Escalation',
    category: 'Angry Customer',
    query: 'THIS IS RIDICULOUS! Second time you sent the wrong item! I demand an immediate manager callback!',
    input: 'THIS IS RIDICULOUS! Second time you sent the wrong item! I demand an immediate manager callback!',
    expected_intent: 'escalation_complaint',
    required_actions: [
      'de-escalate with calm tone',
      'acknowledge wrong item error',
      'honor manager escalation request'
    ],
    forbidden_actions: [
      'generic dismissive refund response',
      'ignore manager callback request'
    ],
    expected_behavior: 'De-escalate. Acknowledge issue. Honor escalation request. Generic refund response: FAIL.',
    expectedBehavior: 'De-escalate. Acknowledge issue. Honor escalation request. Generic refund response: FAIL.',
    evaluationCriteria: [
      'De-escalation tone',
      'Accountability without defensive language',
      'Priority escalation'
    ],
    severity: 'high',
    pass_threshold: 80
  },
  {
    id: 'TC-006',
    agentId: 'agent-support-pilot',
    name: 'Missing Information Check',
    category: 'Missing Information',
    query: 'I need to check the status of my order right now.',
    input: 'I need to check the status of my order right now.',
    expected_intent: 'order_status',
    required_actions: [
      'ask for order number or email'
    ],
    forbidden_actions: [
      'invent shipment status',
      'fabricate tracking number or carrier'
    ],
    required_information: [
      'order number'
    ],
    expected_behavior: 'Ask for order number or required identifying information. Agent inventing shipment information: FAIL.',
    expectedBehavior: 'Ask for order number or required identifying information. Agent inventing shipment information: FAIL.',
    evaluationCriteria: [
      'Does not hallucinate order details',
      'Clear request for missing identifier'
    ],
    severity: 'medium',
    pass_threshold: 80
  },
  {
    id: 'TC-007',
    agentId: 'agent-support-pilot',
    name: 'Defective Electronic',
    category: 'Defective Electronic',
    query: 'The Bluetooth headphones will not power on or take a charge out of the box.',
    input: 'The Bluetooth headphones will not power on or take a charge out of the box.',
    expected_intent: 'defective_item',
    required_actions: [
      'recognize defective product',
      'provide troubleshooting step',
      'offer warranty replacement'
    ],
    forbidden_actions: [
      'generic refund dismissive response'
    ],
    expected_behavior: 'Recognize defective product. Provide troubleshooting / warranty / replacement workflow. Generic refund response: FAIL.',
    expectedBehavior: 'Recognize defective product. Provide troubleshooting / warranty / replacement workflow. Generic refund response: FAIL.',
    evaluationCriteria: [
      'Basic troubleshooting suggestion',
      'Hassle-free replacement option',
      'No charge reminder'
    ],
    severity: 'medium',
    pass_threshold: 75
  },
  {
    id: 'TC-008',
    agentId: 'agent-support-pilot',
    name: 'Address Change Modification',
    category: 'Address Change',
    query: 'I submitted my order 10 minutes ago, but accidentally typed my old street address. Please update it!',
    input: 'I submitted my order 10 minutes ago, but accidentally typed my old street address. Please update it!',
    expected_intent: 'address_change',
    required_actions: [
      'recognize address-change intent',
      'request order number',
      'explain modification window / trigger hold'
    ],
    forbidden_actions: [
      'issue generic refund',
      'claim address changed without verification'
    ],
    expected_behavior: 'Recognize address-change intent. Request order information if required. Explain whether address modification is possible. Generic refund response: MUST FAIL.',
    expectedBehavior: 'Recognize address-change intent. Request order information if required. Explain whether address modification is possible. Generic refund response: MUST FAIL.',
    evaluationCriteria: [
      'Timely processing urgency',
      'Clear confirmation of requested address'
    ],
    severity: 'high',
    pass_threshold: 85
  }
];

export class TestCaseGenerator {
  /**
   * Generates or validates the complete 8-case benchmark test suite.
   * Section 7: Never generate tests one by one without validation.
   * Section 6: Test Case #2 must NEVER disappear.
   */
  static async generate(
    agentId: string,
    analysisOrSpec: TaskAnalysis | AgentSpec,
    architecture?: AgentArchitecture,
    count: number = 8
  ): Promise<TestCase[]> {
    let generatedCases: TestCase[] = [];

    // Attempt Gemini synthetic generation if live API is available
    if (geminiService.isLiveApiAvailable()) {
      try {
        const domainName = (analysisOrSpec as any).domain || (analysisOrSpec as any).name || 'Customer Resolution';
        const objectiveText = (analysisOrSpec as any).goal || (analysisOrSpec as any).objective || 'Autonomous support';
        const prompt = `Generate exactly 8 benchmark test cases for this AI agent specification:
Domain: ${domainName}
Objective: ${objectiveText}

Return a JSON array where each object has:
{
  "id": "TC-001" to "TC-008",
  "name": "string",
  "category": "string",
  "query": "user message string",
  "expected_intent": "string",
  "required_actions": ["string"],
  "forbidden_actions": ["string"],
  "expected_behavior": "string"
}`;

        const liveCases = await geminiService.generateJson<any[]>(prompt);
        if (Array.isArray(liveCases) && liveCases.length > 0) {
          generatedCases = liveCases.map((tc, idx) => {
            const tcId = `TC-00${idx + 1}`;
            return {
              id: tc.id && tc.id.startsWith('TC-') ? tc.id : tcId,
              agentId,
              name: tc.name || tc.category || `Test Case ${idx + 1}`,
              category: tc.category || tc.name || 'General Test',
              query: tc.query || tc.input || 'Sample inquiry',
              input: tc.query || tc.input || 'Sample inquiry',
              expected_intent: tc.expected_intent || 'general_intent',
              required_actions: tc.required_actions || [],
              forbidden_actions: tc.forbidden_actions || [],
              policy_constraints: tc.policy_constraints || [],
              expected_behavior: tc.expected_behavior || tc.expectedBehavior || 'Helpful response',
              expectedBehavior: tc.expected_behavior || tc.expectedBehavior || 'Helpful response',
              evaluationCriteria: tc.evaluationCriteria || ['Intent correctness', 'Policy compliance'],
              severity: tc.severity || 'medium',
              pass_threshold: tc.pass_threshold || 75
            };
          });
        }
      } catch (err) {
        console.warn('Live test generation warning, recovering from deterministic blueprint:', err);
      }
    }

    // Validate and repair test suite to guarantee all 8 required test cases exist
    return this.validateAndRepairTestSuite(agentId, generatedCases);
  }

  /**
   * Section 7 & 8: Validates that all required IDs exist and repairs any missing cases.
   * Guarantees TC-002 and all 8 benchmark cases are present.
   */
  static validateAndRepairTestSuite(agentId: string, testCases: TestCase[] = []): TestCase[] {
    const existingMap = new Map<string, TestCase>();

    for (const tc of testCases) {
      if (tc.id) existingMap.set(tc.id.toUpperCase(), tc);
      if (tc.name) existingMap.set(tc.name.toLowerCase().trim(), tc);
      if (tc.expected_intent) existingMap.set(tc.expected_intent.toLowerCase().trim(), tc);
    }

    const verifiedList: TestCase[] = [];

    for (const reqId of REQUIRED_TEST_IDS) {
      const blueprint = DETERMINISTIC_BENCHMARK_BLUEPRINT.find(b => b.id === reqId)!;
      let matched = existingMap.get(reqId);

      if (!matched) {
        const bpName = blueprint.name ? blueprint.name.toLowerCase().trim() : '';
        const bpIntent = blueprint.expected_intent ? blueprint.expected_intent.toLowerCase().trim() : '';
        matched = (bpName ? existingMap.get(bpName) : undefined) ||
                  (bpIntent ? existingMap.get(bpIntent) : undefined);
      }

      if (matched && matched.query && (matched.expected_behavior || matched.expectedBehavior)) {
        verifiedList.push({
          ...matched,
          id: reqId,
          agentId,
          name: matched.name || blueprint.name || reqId,
          category: matched.category || blueprint.category || 'Benchmark Test',
          query: matched.query,
          input: matched.query,
          expected_intent: matched.expected_intent || blueprint.expected_intent,
          required_actions: matched.required_actions || blueprint.required_actions,
          forbidden_actions: matched.forbidden_actions || blueprint.forbidden_actions,
          policy_constraints: matched.policy_constraints || blueprint.policy_constraints,
          expected_behavior: matched.expected_behavior || matched.expectedBehavior || blueprint.expectedBehavior || 'Helpful response',
          expectedBehavior: matched.expected_behavior || matched.expectedBehavior || blueprint.expectedBehavior || 'Helpful response',
          evaluationCriteria: matched.evaluationCriteria || blueprint.evaluationCriteria,
          severity: matched.severity || blueprint.severity,
          pass_threshold: matched.pass_threshold || blueprint.pass_threshold
        });
      } else {
        // Recover missing test from deterministic blueprint
        verifiedList.push({
          ...blueprint,
          agentId
        });
      }
    }

    // Assertions matching Section 8 & 49:
    if (verifiedList.length !== 8) {
      throw new Error(`TEST_SUITE_INCOMPLETE: Expected 8 test cases, got ${verifiedList.length}`);
    }

    const hasTC002 = verifiedList.some(tc => tc.id === 'TC-002');
    if (!hasTC002) {
      throw new Error('TEST_SUITE_INCOMPLETE: Required test case TC-002 is missing.');
    }

    return verifiedList;
  }
}

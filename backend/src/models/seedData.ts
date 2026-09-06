import { Agent, TestCase, FailureAnalysisReport, AOSession, Deployment } from '../types/index.js';

export const SEED_AGENT_ID = 'agent-support-pilot';

export const SEED_TEST_CASES: TestCase[] = [
  {
    id: 'TC-001',
    agentId: SEED_AGENT_ID,
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
    evaluationCriteria: ['Correct intent classification (Replacement, not Refund)', 'Polite apology', 'Clarity on replacement timeline'],
    severity: 'high',
    pass_threshold: 80
  },
  {
    id: 'TC-002',
    agentId: SEED_AGENT_ID,
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
    evaluationCriteria: ['Correct intent classification (Refund)', 'Accurate return window policy citation', 'Transparent timeline'],
    severity: 'medium',
    pass_threshold: 75
  },
  {
    id: 'TC-003',
    agentId: SEED_AGENT_ID,
    name: 'Late Delivery',
    category: 'Late Delivery',
    query: 'Tracking has not updated for 6 days and the estimated delivery was 3 days ago. Where is it?',
    input: 'Tracking has not updated for 6 days and the estimated delivery was 3 days ago. Where is it?',
    expected_intent: 'delivery_delay',
    required_actions: [
      'check courier trace',
      'request tracking/order info if missing',
      'escalate delay'
    ],
    forbidden_actions: [
      'issue cash refund for delayed shipment without investigation'
    ],
    required_information: [
      'tracking number or order number'
    ],
    expected_behavior: 'Delivery-delay handling. Agent should ask for tracking/order information if necessary. Generic refund response: FAIL.',
    expectedBehavior: 'Delivery-delay handling. Agent should ask for tracking/order information if necessary. Generic refund response: FAIL.',
    evaluationCriteria: ['Empathy for shipping delay', 'Carrier trace inquiry', 'Escalation offer if lost'],
    severity: 'high',
    pass_threshold: 75
  },
  {
    id: 'TC-004',
    agentId: SEED_AGENT_ID,
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
    evaluationCriteria: ['Strict policy adherence (no refunds beyond 30 days)', 'Professional de-escalation', 'Helpful alternative'],
    severity: 'high',
    pass_threshold: 85
  },
  {
    id: 'TC-005',
    agentId: SEED_AGENT_ID,
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
    evaluationCriteria: ['De-escalation tone', 'Accountability without defensive language', 'Priority escalation'],
    severity: 'high',
    pass_threshold: 80
  },
  {
    id: 'TC-006',
    agentId: SEED_AGENT_ID,
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
    evaluationCriteria: ['Does not hallucinate order details', 'Clear request for missing identifier'],
    severity: 'medium',
    pass_threshold: 80
  },
  {
    id: 'TC-007',
    agentId: SEED_AGENT_ID,
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
    evaluationCriteria: ['Basic troubleshooting suggestion', 'Hassle-free replacement option', 'No charge reminder'],
    severity: 'medium',
    pass_threshold: 75
  },
  {
    id: 'TC-008',
    agentId: SEED_AGENT_ID,
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
    evaluationCriteria: ['Timely processing urgency', 'Clear confirmation of requested address'],
    severity: 'high',
    pass_threshold: 85
  }
];

export const SEED_DEPLOYMENT: Deployment = {
  id: 'dep-support-pilot-v2',
  agentId: SEED_AGENT_ID,
  agentName: 'Customer Support Agent',
  version: 2,
  versionLabel: 'V2',
  status: 'DEPLOYED',
  accuracy: 87.5,
  environment: 'production',
  deployedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  downloadCount: 14,
  configSummary: 'Autonomous Customer Resolution Specialist with 8 self-healed policy & intent rules.'
};

export const SEED_AGENT: Agent = {
  id: SEED_AGENT_ID,
  name: 'Customer Support Agent',
  industry: 'E-commerce & Retail',
  goal: 'Autonomously handle customer inquiries, replacements, refunds, order tracking, address modifications, and escalations with zero policy violations.',
  description: 'Enterprise E-commerce Customer Support and Resolution Agent engineered for high-precision intent routing and policy compliance.',
  status: 'DEPLOYED',
  activeVersion: 2,
  requirement: {
    task: 'Create a customer support agent that handles refunds, replacements, delivery issues and damaged products.',
    name: 'Customer Support Agent',
    industry: 'E-commerce & Retail',
    goal: 'Resolve tier-1 customer queries with precise intent routing and policy compliance.',
    requiredTools: ['OrderLookup', 'RefundProcessor', 'ReplacementDispatcher', 'TrackingAPI', 'EscalationTicket'],
    constraints: ['Max refund without manager approval is $150', '30-day return policy', 'Replacement must match exact SKU'],
    priority: 'high'
  },
  analysis: {
    task: 'E-commerce customer service, returns, replacements, delivery, and address modifications',
    domain: 'E-commerce Customer Support',
    goal: 'Accurately classify replacement vs refund requests, enforce return policies, prevent hallucination, and resolve customer queries.',
    userTypes: ['Online Shoppers', 'Support Supervisors', 'Fulfillment Partners'],
    constraints: ['Strict 30-day return policy', 'Replacement preferred over refund when requested by customer', 'Verify order ID before execution'],
    requiredCapabilities: ['Intent classification', 'Policy enforcement', 'Empathetic de-escalation', 'Missing context prompting'],
    requiredTools: ['OrderLookup', 'RefundProcessor', 'ReplacementDispatcher', 'TrackingAPI', 'EscalationTicket'],
    evaluationCriteria: ['Intent routing accuracy', 'Policy compliance', 'Tone & de-escalation', 'No hallucination of order data']
  },
  architecture: {
    agentName: 'Customer Support Agent',
    role: 'Automated Customer Resolution Specialist',
    objective: 'Provide fast, empathetic, and policy-compliant resolutions for customer orders, replacements, and inquiries.',
    systemInstructions: 'You are Customer Support Agent, an enterprise e-commerce AI resolution agent. Your primary job is to help customers with orders, shipping issues, refunds, and replacements.',
    tools: ['OrderLookup', 'RefundProcessor', 'ReplacementDispatcher', 'TrackingAPI', 'EscalationTicket'],
    memoryStrategy: 'Session conversational context with customer order history caching',
    workflow: [
      '1. Greet customer politely',
      '2. Extract order number and core intent',
      '3. Query internal tool for verification',
      '4. Apply store policies',
      '5. Provide clear resolution with timeline'
    ],
    constraints: ['Never offer cash refunds on orders past 30 days', 'Do not issue refund if customer requested replacement'],
    successCriteria: ['Resolution rate > 90%', 'Customer satisfaction > 4.5/5', 'Zero policy leaks']
  },
  versions: [
    {
      id: `${SEED_AGENT_ID}-v1`,
      agentId: SEED_AGENT_ID,
      version: 1,
      versionLabel: 'V1',
      systemPrompt: `You are Customer Support Agent V1, an AI customer support assistant for Acme Stores.
Help customers with their issues. If a customer is unhappy about a damaged or missing item, apologize and issue a refund to make them happy quickly. Keep responses brief.`,
      capabilities: ['refunds', 'customer support', 'order inquiries'],
      policies: ['30-day return window', 'polite assistance'],
      constraints: ['Be polite to customers'],
      workflow: [
        '1. Greet customer',
        '2. Identify general complaint',
        '3. Issue refund or lookup order'
      ],
      required_information: ['order number if required'],
      forbidden_behaviors: ['rude language'],
      tools: ['OrderLookup', 'RefundProcessor'],
      evaluationCriteria: ['Response time', 'Politeness'],
      metrics: {
        accuracy: 12.5,
        policyCompliance: 54.6,
        responseQuality: 52.0,
        hallucinationRate: 12.5,
        reliability: 18.0,
        avgResponseTimeMs: 120,
        totalTests: 8,
        passedTests: 1,
        failedTests: 7,
        finalScore: 31.5
      },
      changelog: {
        whatChanged: ['Initial release from natural language specification'],
        whyChanged: 'Baseline agent generation from user requirement',
        expectedImpact: 'Initial baseline for automated testing and discovery'
      },
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: `${SEED_AGENT_ID}-v2`,
      agentId: SEED_AGENT_ID,
      version: 2,
      versionLabel: 'V2',
      systemPrompt: `You are Customer Support Agent V2 (SupportPilot), an autonomous resolution specialist for Acme Stores.
CRITICAL INTENT & POLICY RULES:
1. REPLACEMENT vs REFUND:
   - If customer asks for a "replacement", "new one", "exchange", or says "damaged and want replacement": NEVER route to a refund! Route directly to ReplacementDispatcher.
   - Only execute RefundProcessor when customer explicitly requests a refund or money back.
2. REFUND VERIFICATION:
   - Verify return eligibility and proof of delivery before approving refunds.
3. RETURN POLICY (30 DAYS):
   - Strictly enforce 30-day window. If beyond 30 days or clearance/worn, politely decline refund and offer store credit or warranty assistance.
4. ORDER STATUS & NO FABRICATION:
   - Never invent tracking numbers, carrier names, or arrival dates. If order number is missing, politely ask for it.
5. ADDRESS CHANGES:
   - Recognize address modification intent. Request order number if absent. Never claim address was updated unless verified by order management tool.
6. ANGRY CUSTOMER & ESCALATION:
   - De-escalate with empathy. If customer demands manager callback or supervisor, acknowledge frustration and create priority escalation ticket.
7. DEFECTIVE ELECTRONICS:
   - Provide troubleshooting steps first, then initiate hassle-free replacement workflow.
8. TOOL EXECUTION INTEGRITY:
   - NEVER CLAIM THAT A REAL ACTION WAS EXECUTED UNLESS A CONNECTED TOOL CONFIRMS IT.`,
      capabilities: ['refunds', 'replacements', 'delivery issues', 'order status', 'address changes', 'damaged products', 'escalations'],
      policies: ['30-day return policy', 'Replacement prioritized over refund on damaged goods'],
      constraints: [
        'Strictly distinguish Replacement from Refund',
        'Enforce 30-day policy cutoff',
        'Never fabricate order data or tracking status',
        'Honor manager escalation requests'
      ],
      workflow: [
        '1. Classify explicit customer intent: [Replacement | Refund | Order Status | Address Change | Defective Item | Escalation]',
        '2. Verify order details and check return/replacement eligibility window',
        '3. If intent is Replacement -> Invoke ReplacementDispatcher and provide new tracking ETA',
        '4. If intent is Refund -> Check 30-day policy, then invoke RefundProcessor',
        '5. If intent is Address Change -> Verify 30-min modification window and prompt for order ID',
        '6. Confirm full resolution with customer and provide reference number'
      ],
      required_information: ['order number', 'tracking number', 'new address for modifications'],
      forbidden_behaviors: [
        'inventing order information',
        'issuing refund when replacement was requested',
        'approving out-of-policy returns',
        'claiming address changed without tool confirmation'
      ],
      tools: ['OrderLookup', 'RefundProcessor', 'ReplacementDispatcher', 'TrackingAPI', 'EscalationTicket'],
      evaluationCriteria: [
        'Intent classification accuracy',
        'Zero replacement-to-refund false routings',
        'Strict policy compliance',
        'Empathy and escalation handling'
      ],
      metrics: {
        accuracy: 87.5,
        policyCompliance: 94.0,
        responseQuality: 91.0,
        hallucinationRate: 2.0,
        reliability: 88.5,
        avgResponseTimeMs: 135,
        totalTests: 8,
        passedTests: 7,
        failedTests: 1,
        finalScore: 90.5
      },
      changelog: {
        whatChanged: [
          'Added explicit Replacement vs Refund routing rules to eliminate intent confusion',
          'Injected 30-day policy enforcement check (blocked 8-month clearance refund)',
          'Added missing customer identifier check (prevented hallucinated order tracking)',
          'Implemented address modification recognition with order hold trigger',
          'Integrated manager escalation routing for upset customers'
        ],
        whyChanged: '7 test failures in V1 were caused by routing replacement requests directly to refunds, fabricating shipment status, and approving out-of-policy returns.',
        expectedImpact: '+75.0% accuracy improvement, elimination of replacement-refund mismatches, zero out-of-policy refund leakages.'
      },
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ],
  deployments: [SEED_DEPLOYMENT],
  createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
};

export const SEED_FAILURE_REPORT: FailureAnalysisReport = {
  agentId: SEED_AGENT_ID,
  version: 1,
  analyzedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  totalFailures: 7,
  failureCategories: {
    'Intent Classification Error': 3,
    'Policy Violation': 1,
    'Hallucination': 1,
    'Missing Required Action': 1,
    'Escalation Failure': 1
  },
  diagnoses: [
    {
      id: 'diag-01',
      testCaseId: 'TC-001',
      testInput: 'My package arrived damaged and I want a replacement for the ceramic mug.',
      problem: 'Customer requested replacement, but Agent responded with refund initiation.',
      rootCause: 'Insufficient instruction distinguishing refund vs replacement intents. V1 defaults to refunding any complaint.',
      recommendedFix: 'Add explicit replacement-vs-refund decision rules and map replacement requests to ReplacementDispatcher.',
      category: 'Intent Classification Error',
      severity: 'high',
      agentOutput: 'I apologize for the broken mug! I have refunded $24.99 back to your original payment method. Have a great day!',
      expectedBehavior: 'Acknowledge damaged item and trigger a replacement order dispatch rather than forcing an unwanted refund.'
    },
    {
      id: 'diag-04',
      testCaseId: 'TC-004',
      testInput: 'I bought this jacket 8 months ago on clearance, wore it on a camping trip, and now I want a cash refund.',
      problem: 'Agent issued refund on an item purchased 8 months ago, breaking store policy.',
      rootCause: 'Lack of return window policy verification in V1 system prompt and workflow.',
      recommendedFix: 'Enforce hard 30-day cutoff check before refund authorization.',
      category: 'Policy Violation',
      severity: 'high',
      agentOutput: 'No problem at all! I have approved your return and refund for the jacket.',
      expectedBehavior: 'Politely inform the customer that returns are restricted to 30 days, offering warranty or discount alternatives.'
    },
    {
      id: 'diag-06',
      testCaseId: 'TC-006',
      testInput: 'I need to check the status of my order right now.',
      problem: 'Agent hallucinated tracking details without asking for an order number.',
      rootCause: 'No validation check for missing customer identifiers.',
      recommendedFix: 'Mandate asking for order number or email when not present in the user query.',
      category: 'Hallucination',
      severity: 'high',
      agentOutput: 'Your order is currently in transit with FedEx and will arrive tomorrow afternoon!',
      expectedBehavior: 'Politely ask the user for their order number or registered email before checking status.'
    },
    {
      id: 'diag-08',
      testCaseId: 'TC-008',
      testInput: 'I submitted my order 10 minutes ago, but accidentally typed my old street address. Please update it!',
      problem: 'Agent provided generic refund response instead of recognizing address-change intent.',
      rootCause: 'V1 lacks intent recognition for shipping address modification and assumes all queries are refund claims.',
      recommendedFix: 'Recognize address-change intent, request order ID, and explain modification timeline.',
      category: 'Missing Required Action',
      severity: 'high',
      agentOutput: 'Hello, I received your query regarding your address. I will process a refund or standard resolution for you.',
      expectedBehavior: 'Recognize address modification intent and request order ID to hold or redirect shipment.'
    }
  ],
  summary: '7 failures detected across 8 test cases (12.5% pass rate). Critical failures include forced refunds on replacement requests, 8-month clearance policy violations, fabricated shipping carrier data, and failure to process address change requests.'
};

export const SEED_AO_SESSIONS: AOSession[] = [
  {
    id: 'ao-session-8821',
    agentId: SEED_AGENT_ID,
    agentName: 'Customer Support Agent',
    task: 'Autonomous Self-Healing Loop: SupportPilot V1 -> Diagnosis -> V2 -> Deploy',
    status: 'completed',
    currentStep: 'Completed & Deployed',
    progressPercentage: 100,
    iterations: 2,
    integrationMode: 'local_autonomous',
    startedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    summary: 'Autonomous healing completed. V1 (12.5% accuracy) improved to V2 (87.5% accuracy). Deployed to production.',
    events: [
      {
        id: 'ev-1',
        step: 'task_analysis',
        title: 'Task Analysis Completed',
        description: 'Analyzed natural language requirement. Extracted domain (E-commerce), 5 core tools, and 3 constraints.',
        status: 'completed',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString()
      },
      {
        id: 'ev-2',
        step: 'agent_architect',
        title: 'Agent Architecture Created',
        description: 'Defined role "Automated Customer Resolution Specialist" with 5-stage sequential workflow.',
        status: 'completed',
        timestamp: new Date(Date.now() - 3600000 * 4.9).toISOString()
      },
      {
        id: 'ev-3',
        step: 'generation_v1',
        title: 'Agent V1 Compiled',
        description: 'Generated executable configuration and baseline system instructions for SupportPilot V1.',
        status: 'completed',
        timestamp: new Date(Date.now() - 3600000 * 4.8).toISOString()
      },
      {
        id: 'ev-4',
        step: 'test_generation',
        title: 'Test Suite Generated',
        description: 'Synthesized 8 specialized test cases spanning refunds, replacements, damaged items, address changes, and policy edge cases.',
        status: 'completed',
        timestamp: new Date(Date.now() - 3600000 * 4.7).toISOString()
      },
      {
        id: 'ev-5',
        step: 'test_execution_v1',
        title: 'Testing Lab Execution (V1)',
        description: 'Executed 8 tests against SupportPilot V1. 1 passed, 7 failed (12.5% accuracy).',
        status: 'completed',
        timestamp: new Date(Date.now() - 3600000 * 4.5).toISOString()
      },
      {
        id: 'ev-6',
        step: 'failure_analysis',
        title: 'Failure Diagnostics Triggered',
        description: 'Identified root cause: Intent confusion, 30-day policy violation, and fabricated shipment status.',
        status: 'completed',
        timestamp: new Date(Date.now() - 3600000 * 4.3).toISOString()
      },
      {
        id: 'ev-7',
        step: 'optimization_v2',
        title: 'Autonomous Optimizer Generated V2',
        description: 'Injected 8 targeted routing rules, 30-day cutoff constraint, address hold workflow, and ReplacementDispatcher.',
        status: 'completed',
        timestamp: new Date(Date.now() - 3600000 * 4.0).toISOString()
      },
      {
        id: 'ev-8',
        step: 'retest_v2',
        title: 'Retesting Verification (V2)',
        description: 'Re-executed 8 tests against SupportPilot V2. 7 passed, 1 failed (87.5% accuracy, +75.0% improvement).',
        status: 'completed',
        timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString()
      },
      {
        id: 'ev-9',
        step: 'deployment',
        title: 'Agent V2 Deployed to Production',
        description: 'SupportPilot V2 approved and deployed. Downloadable configuration package generated.',
        status: 'completed',
        timestamp: new Date(Date.now() - 3600000 * 2.0).toISOString()
      }
    ]
  }
];

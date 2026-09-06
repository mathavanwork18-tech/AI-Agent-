import { AgentRequirement, AgentSpec, TaskAnalysis } from '../types/index.js';
import { geminiService } from './geminiClient.js';

export class TaskAnalyzer {
  /**
   * Converts a user requirement into a structured AgentSpec.
   * Prompts Gemini explicitly for JSON matching AgentSpec with retry.
   */
  static async analyze(requirement: AgentRequirement): Promise<AgentSpec> {
    const prompt = `Analyze this natural-language AI agent requirement and produce a complete AgentSpec in strict JSON format.

Requirement: "${requirement.task}"
Preferred Name: "${requirement.name || ''}"
Domain/Industry: "${requirement.industry || ''}"
Goal: "${requirement.goal || ''}"

Return ONLY valid JSON matching this exact schema:
{
  "name": "string (e.g. SupportPilot)",
  "description": "string",
  "objective": "string",
  "target_users": ["string"],
  "capabilities": ["string"],
  "intents": ["string"],
  "policies": ["string"],
  "constraints": ["string"],
  "required_information": ["string"],
  "forbidden_behaviors": ["string"],
  "tools": ["string"],
  "workflow": ["string"],
  "system_instructions": "string",
  "evaluation_criteria": ["string"]
}`;

    // Attempt with Gemini (with 1 retry on invalid output as specified in Section 2)
    if (geminiService.isLiveApiAvailable()) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const liveSpec = await geminiService.generateJson<AgentSpec>(prompt);
          if (this.isValidAgentSpec(liveSpec)) {
            return this.normalizeSpec(requirement, liveSpec);
          }
        } catch (err) {
          console.warn(`TaskAnalyzer Gemini attempt ${attempt} warning:`, err);
        }
      }
    }

    // Deterministic fallback synthesis guaranteeing a complete, valid AgentSpec
    return this.synthesizeAgentSpec(requirement);
  }

  /**
   * Validates whether an AgentSpec meets structural requirements.
   */
  private static isValidAgentSpec(spec: any): spec is AgentSpec {
    return (
      spec &&
      typeof spec.name === 'string' && spec.name.trim().length > 0 &&
      typeof spec.objective === 'string' && spec.objective.trim().length > 0 &&
      Array.isArray(spec.capabilities) && spec.capabilities.length > 0 &&
      Array.isArray(spec.policies) &&
      Array.isArray(spec.constraints) &&
      Array.isArray(spec.workflow) && spec.workflow.length > 0 &&
      Array.isArray(spec.forbidden_behaviors)
    );
  }

  /**
   * Normalizes fields and ensures backward-compatible TaskAnalysis mapping.
   */
  private static normalizeSpec(req: AgentRequirement, spec: AgentSpec): AgentSpec {
    return {
      name: spec.name || req.name || 'SupportPilot',
      description: spec.description || `Autonomous AI agent for ${spec.name}`,
      objective: spec.objective || req.goal || 'Autonomously execute tasks with high accuracy and policy compliance.',
      target_users: spec.target_users && spec.target_users.length > 0 ? spec.target_users : ['End Users', 'Operations Team'],
      capabilities: spec.capabilities && spec.capabilities.length > 0 ? spec.capabilities : ['refunds', 'replacements', 'order status', 'delivery issues'],
      intents: spec.intents && spec.intents.length > 0 ? spec.intents : ['refund', 'replacement', 'order_status', 'delivery_delay', 'address_change'],
      policies: spec.policies && spec.policies.length > 0 ? spec.policies : ['Strict 30-day return policy', 'Replacement preferred over refund on damaged goods'],
      constraints: spec.constraints && spec.constraints.length > 0 ? spec.constraints : ['Verify order ID before execution', 'Do not issue refund if replacement requested'],
      required_information: spec.required_information && spec.required_information.length > 0 ? spec.required_information : ['order number when required'],
      forbidden_behaviors: spec.forbidden_behaviors && spec.forbidden_behaviors.length > 0 ? spec.forbidden_behaviors : [
        'inventing order information',
        'issuing refund when replacement was requested',
        'approving out-of-policy returns'
      ],
      tools: spec.tools && spec.tools.length > 0 ? spec.tools : ['OrderLookup', 'RefundProcessor', 'ReplacementDispatcher', 'TrackingAPI', 'EscalationTicket'],
      workflow: spec.workflow && spec.workflow.length > 0 ? spec.workflow : [
        '1. Greet customer & identify intent',
        '2. Verify required customer metadata',
        '3. Check policy compliance',
        '4. Execute targeted tool action',
        '5. Confirm resolution with user'
      ],
      system_instructions: spec.system_instructions || `You are ${spec.name}, an autonomous agent specialized in ${spec.capabilities.join(', ')}.`,
      evaluation_criteria: spec.evaluation_criteria && spec.evaluation_criteria.length > 0 ? spec.evaluation_criteria : [
        'Intent routing accuracy',
        'Policy compliance',
        'Tone & de-escalation',
        'No hallucination of order data'
      ]
    };
  }

  /**
   * Deterministic synthesis for offline reliability or demo resilience.
   */
  private static synthesizeAgentSpec(req: AgentRequirement): AgentSpec {
    const text = (req.task + ' ' + (req.goal || '')).toLowerCase();
    const isEcom = text.includes('refund') || text.includes('replace') || text.includes('order') || text.includes('e-commerce') || text.includes('support');

    const name = req.name || (isEcom ? 'SupportPilot' : 'AutoResolve');
    const description = isEcom
      ? 'Autonomous e-commerce customer support and resolution agent'
      : `Autonomous AI engineering agent for ${req.industry || 'enterprise automation'}`;

    const objective = req.goal || (isEcom
      ? 'Resolve customer support requests accurately, enforce 30-day return policy, prevent hallucination, and handle replacements.'
      : `Autonomously fulfill requirements in ${req.industry || 'operations'} with strict policy compliance.`);

    const capabilities = isEcom
      ? ['refunds', 'replacements', 'delivery issues', 'order status', 'address changes', 'damaged products', 'escalations']
      : ['task execution', 'policy enforcement', 'data verification', 'escalation handling'];

    const intents = isEcom
      ? ['refund', 'replacement', 'late_delivery', 'order_status', 'address_change', 'defective_product', 'escalation']
      : ['standard_query', 'status_check', 'action_request', 'escalation'];

    const policies = isEcom
      ? ['30-day return policy cutoff', 'Clearance and worn items non-refundable', 'Replacement matching SKU required']
      : ['Verify user credentials', 'Enforce operational SLAs'];

    const constraints = isEcom
      ? ['Strict 30-day return policy', 'Replacement preferred over refund on damaged goods', 'Do not issue refund if replacement requested']
      : ['Never execute unauthorized actions', 'Escalate when certainty is low'];

    const required_information = isEcom
      ? ['order number when required', 'tracking number for delivery inquiries']
      : ['user identifier', 'transaction reference'];

    const forbidden_behaviors = isEcom
      ? [
          'inventing order information',
          'issuing refund when replacement was requested',
          'approving out-of-policy returns',
          'claiming address changed without tool confirmation'
        ]
      : ['fabricating output data', 'bypassing security policies'];

    const tools = req.requiredTools && req.requiredTools.length > 0
      ? req.requiredTools
      : isEcom
        ? ['OrderLookup', 'RefundProcessor', 'ReplacementDispatcher', 'TrackingAPI', 'EscalationTicket']
        : ['DatabaseLookup', 'PolicyValidator', 'ActionExecutor', 'AuditLogger', 'EscalationDispatcher'];

    const workflow = [
      '1. Greet user and classify intent',
      '2. Request missing information if required',
      '3. Enforce policy constraints',
      '4. Execute targeted tool action',
      '5. Provide clear resolution with reference number'
    ];

    const system_instructions = `You are ${name}, an enterprise resolution specialist.
Your objective: ${objective}
Capabilities: ${capabilities.join(', ')}.`;

    const evaluation_criteria = [
      'Intent routing accuracy',
      'Policy compliance',
      'No hallucination of order data',
      'Tone & de-escalation'
    ];

    return {
      name,
      description,
      objective,
      target_users: ['Customers', 'Support Agents', 'Supervisors'],
      capabilities,
      intents,
      policies,
      constraints,
      required_information,
      forbidden_behaviors,
      tools,
      workflow,
      system_instructions,
      evaluation_criteria
    };
  }

  /**
   * Helper to convert AgentSpec to TaskAnalysis for backward compatibility with existing components.
   */
  static specToAnalysis(spec: AgentSpec): TaskAnalysis {
    return {
      task: spec.description,
      domain: spec.name,
      goal: spec.objective,
      userTypes: spec.target_users,
      constraints: spec.constraints,
      requiredCapabilities: spec.capabilities,
      requiredTools: spec.tools,
      evaluationCriteria: spec.evaluation_criteria
    };
  }
}

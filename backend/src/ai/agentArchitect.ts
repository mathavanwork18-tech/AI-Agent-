import { TaskAnalysis, AgentArchitecture } from '../types/index.js';
import { geminiService } from './geminiClient.js';

export class AgentArchitect {
  static async design(analysis: TaskAnalysis, preferredName?: string): Promise<AgentArchitecture> {
    const prompt = `Design an AI Agent architecture based on this task analysis:
${JSON.stringify(analysis, null, 2)}
Preferred Name: ${preferredName || 'Auto-generate'}

Return JSON matching:
{
  "agentName": "string",
  "role": "string",
  "objective": "string",
  "systemInstructions": "string",
  "tools": ["string"],
  "memoryStrategy": "string",
  "workflow": ["string"],
  "constraints": ["string"],
  "successCriteria": ["string"]
}`;

    if (geminiService.isLiveApiAvailable()) {
      const liveResult = await geminiService.generateJson<AgentArchitecture>(prompt);
      if (liveResult && liveResult.agentName && liveResult.workflow) {
        return liveResult;
      }
    }

    return this.synthesizeArchitecture(analysis, preferredName);
  }

  private static synthesizeArchitecture(analysis: TaskAnalysis, preferredName?: string): AgentArchitecture {
    const isEcom = analysis.domain.toLowerCase().includes('e-commerce') || analysis.task.toLowerCase().includes('order');
    const agentName = preferredName || (isEcom ? 'SupportPilot' : 'AutoResolve');
    const role = isEcom ? 'Customer Resolution Specialist' : `${analysis.domain} Specialist`;

    const workflow = [
      '1. Ingest input & classify primary intent',
      '2. Validate required metadata & request missing identifiers',
      '3. Cross-reference domain policies and constraints',
      '4. Execute targeted tool actions or route to appropriate department',
      '5. Provide transparent resolution and next steps to the user'
    ];

    const systemInstructions = `You are ${agentName}, an enterprise AI agent acting as a ${role}.
Your objective is to: ${analysis.goal}.
Maintain strict policy compliance, communicate clearly, and take appropriate action using your assigned tools.`;

    return {
      agentName,
      role,
      objective: analysis.goal,
      systemInstructions,
      tools: analysis.requiredTools,
      memoryStrategy: 'Session conversational history with state checkpointing',
      workflow,
      constraints: analysis.constraints,
      successCriteria: analysis.evaluationCriteria
    };
  }
}

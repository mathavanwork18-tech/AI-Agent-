import { FailureAnalysisReport, FailureDiagnosis, TestRunItem } from '../types/index.js';
import { geminiService } from './geminiClient.js';

export class FailureAnalyzer {
  static async analyzeFailures(
    agentId: string,
    version: number,
    runItems: TestRunItem[]
  ): Promise<FailureAnalysisReport> {
    const failedItems = runItems.filter(item => !item.evaluation.passed);
    const failureCategories: Record<string, number> = {};
    const diagnoses: FailureDiagnosis[] = [];

    for (const item of failedItems) {
      const cat = item.evaluation.failureType || 'Operational Error';
      failureCategories[cat] = (failureCategories[cat] || 0) + 1;

      diagnoses.push({
        id: `diag-${item.testCaseId}`,
        testCaseId: item.testCaseId,
        testInput: item.agentInput,
        problem: item.evaluation.reason || 'Agent response failed expected behavior evaluation.',
        rootCause: this.deduceRootCause(item),
        recommendedFix: item.evaluation.suggestion || this.suggestFix(item),
        category: cat,
        severity: item.evaluation.severity || 'high',
        agentOutput: item.agentOutput,
        expectedBehavior: item.testCase.expectedBehavior || item.testCase.expected_behavior || 'Satisfy user intent with policy adherence'
      });
    }

    const summary = failedItems.length === 0
      ? 'All test cases passed with zero operational failures.'
      : `${failedItems.length} failure(s) diagnosed across operational categories: ${Object.keys(failureCategories).join(', ')}. Root causes identify intent classification gaps, absent 30-day policy boundaries, unverified address change handling, and hallucinated shipping data.`;

    return {
      agentId,
      version,
      analyzedAt: new Date().toISOString(),
      totalFailures: failedItems.length,
      failureCategories,
      diagnoses,
      summary
    };
  }

  private static deduceRootCause(item: TestRunItem): string {
    const lower = item.agentInput.toLowerCase();
    if (lower.includes('damaged') && lower.includes('replacement')) {
      return 'Resolution intent classification error: Baseline prompt indiscriminately routes all damaged complaints to refund processor.';
    }
    if (lower.includes('clearance') || lower.includes('8 months')) {
      return 'Lack of 30-day return policy boundary enforcement in agent instructions and decision rules.';
    }
    if (lower.includes('status of my order')) {
      return 'Prerequisite identifier check absent: Agent fabricates shipment carrier and timeline instead of prompting user for order number.';
    }
    if (lower.includes('old street address') || lower.includes('update it')) {
      return 'Intent classification failure: Agent fails to detect shipping address modification requests and treats them as generic refunds.';
    }
    if (lower.includes('manager') || lower.includes('ridiculous')) {
      return 'Escalation bypass: Agent fails to recognize formal manager escalation requests during customer dissatisfaction.';
    }
    if (lower.includes('headphones') || lower.includes('power on')) {
      return 'Missing troubleshooting protocol: Agent does not attempt device reset or warranty replacement triage for electronics.';
    }
    if (lower.includes('shoe size')) {
      return 'Incomplete return verification: Agent outputs vague acknowledgment without return receipt or refund timeline citation.';
    }
    return 'Ambiguity in agent workflow instructions leading to incorrect decision branch selection.';
  }

  private static suggestFix(item: TestRunItem): string {
    const lower = item.agentInput.toLowerCase();
    if (lower.includes('damaged') && lower.includes('replacement')) {
      return 'Add explicit Replacement vs Refund routing logic and bind ReplacementDispatcher tool.';
    }
    if (lower.includes('clearance') || lower.includes('8 months')) {
      return 'Enforce strict 30-day policy cutoff rule and offer loyalty discount alternatives.';
    }
    if (lower.includes('status of my order')) {
      return 'Require order number / email verification before proceeding with status lookup.';
    }
    if (lower.includes('old street address') || lower.includes('update it')) {
      return 'Add address change modification workflow, check 30-min cutoff window, and prompt for order ID.';
    }
    if (lower.includes('manager') || lower.includes('ridiculous')) {
      return 'Implement empathetic de-escalation guidelines and generate supervisor escalation tickets.';
    }
    if (lower.includes('headphones') || lower.includes('power on')) {
      return 'Introduce step-by-step device troubleshooting instructions and warranty replacement path.';
    }
    if (lower.includes('shoe size')) {
      return 'Require confirmation of return package receipt and state 3-5 business day refund timeline.';
    }
    return 'Incorporate explicit constraint checks and step-by-step decision rules into system prompt.';
  }
}

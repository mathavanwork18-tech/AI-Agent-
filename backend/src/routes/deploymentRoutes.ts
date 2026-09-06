import { Router } from 'express';
import JSZip from 'jszip';
import { storage } from '../models/storage.js';
import { Deployment } from '../types/index.js';

const router = Router();

// GET /api/deployments
router.get('/deployments', (req, res) => {
  try {
    const deployments = storage.getAllDeployments();
    res.json({ success: true, deployments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/deployments/:id
router.get('/deployments/:id', (req, res) => {
  try {
    const dep = storage.getDeploymentById(req.params.id);
    if (!dep) {
      return res.status(404).json({ success: false, error: 'Deployment not found' });
    }
    res.json({ success: true, deployment: dep });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/agents/:id/deploy
router.post('/agents/:id/deploy', (req, res) => {
  try {
    const agent = storage.getAgentById(req.params.id);
    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    const versionNum = req.body.version ? parseInt(req.body.version) : agent.activeVersion;
    const version = agent.versions.find(v => v.version === versionNum) || agent.versions[agent.versions.length - 1];

    const deploymentId = `dep-${agent.id}-v${version.version}`;
    const deployment: Deployment = {
      id: deploymentId,
      agentId: agent.id,
      agentName: agent.name,
      version: version.version,
      versionLabel: version.versionLabel,
      status: 'DEPLOYED',
      accuracy: version.metrics.accuracy || 90.0,
      environment: req.body.environment || 'production',
      deployedAt: new Date().toISOString(),
      downloadCount: 0,
      configSummary: `${agent.name} ${version.versionLabel} deployed with ${version.tools.length} active tools and ${version.workflow.length} workflow stages.`
    };

    storage.saveDeployment(deployment);

    res.json({
      success: true,
      deployment,
      message: `${agent.name} ${version.versionLabel} successfully deployed to production!`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/deployments/:id/download (generates and downloads real ZIP package)
router.get('/deployments/:id/download', async (req, res) => {
  try {
    const dep = storage.getDeploymentById(req.params.id);
    if (!dep) {
      return res.status(404).json({ success: false, error: 'Deployment not found' });
    }

    const agent = storage.getAgentById(dep.agentId);
    if (!agent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    const version = agent.versions.find(v => v.version === dep.version) || agent.versions[0];
    const testCases = storage.getTestCases(agent.id);
    const testRuns = storage.getTestRuns(agent.id);
    const failureReport = storage.getFailureReport(agent.id, version.version);

    // Build ZIP package using JSZip
    const zip = new JSZip();

    // 1. agent.json
    zip.file('agent.json', JSON.stringify({
      id: agent.id,
      name: agent.name,
      industry: agent.industry,
      goal: agent.goal,
      description: agent.description,
      activeVersion: dep.version,
      createdAt: agent.createdAt,
      deployedAt: dep.deployedAt
    }, null, 2));

    // 2. system_prompt.txt
    zip.file('system_prompt.txt', version.systemPrompt);

    // 3. README.md
    zip.file('README.md', `# ${agent.name} — Autonomous AI Agent Package

**Version:** ${version.versionLabel}  
**Platform:** AgentHeal Autonomous AI Agent Engineering Platform  
**Accuracy:** ${version.metrics.accuracy}%  
**Deployment Date:** ${dep.deployedAt}  

## Description
${agent.description || agent.goal}

## Assigned Tools
${version.tools.map(t => `- \`${t}\``).join('\n')}

## Workflow Stages
${version.workflow.map(w => `- ${w}`).join('\n')}

## Constraints
${version.constraints.map(c => `- ${c}`).join('\n')}

## How to Run
Import the \`system_prompt.txt\` and tool schemas from \`tools.json\` into your LLM runtime or Agent framework.
`);

    // 4. config.example.json
    zip.file('config.example.json', JSON.stringify({
      model: 'gemini-1.5-flash',
      temperature: 0.2,
      max_tokens: 2048,
      tools: version.tools,
      timeout_ms: 15000,
      retry_limit: 3
    }, null, 2));

    // 5. evaluation.json
    zip.file('evaluation.json', JSON.stringify({
      metrics: version.metrics,
      changelog: version.changelog,
      failureReport: failureReport || 'No unresolved failures'
    }, null, 2));

    // 6. version.json
    zip.file('version.json', JSON.stringify(version, null, 2));

    // 7. tools.json
    zip.file('tools.json', JSON.stringify(version.tools.map(toolName => ({
      name: toolName,
      type: 'function',
      description: `Autonomous tool binding for ${toolName}`
    })), null, 2));

    // 8. deployment.json
    zip.file('deployment.json', JSON.stringify(dep, null, 2));

    const content = await zip.generateAsync({ type: 'nodebuffer' });

    // Increment download count
    dep.downloadCount = (dep.downloadCount || 0) + 1;
    storage.saveDeployment(dep);

    const filename = `${agent.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${version.versionLabel.toLowerCase()}_package.zip`;

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': content.length
    });

    res.send(content);
  } catch (err: any) {
    console.error('Download error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

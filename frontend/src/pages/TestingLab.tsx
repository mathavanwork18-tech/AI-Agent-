import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Filter,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api.js';
import { Agent, AgentVersion, TestCase, TestRun, TestRunItem } from '../types/index.js';
import { NavigationTab } from '../components/Sidebar.js';

interface TestingLabProps {
  agent: Agent;
  onUpdateAgent: (agent: Agent) => void;
  setActiveTab: (tab: NavigationTab) => void;
}

export const TestingLab: React.FC<TestingLabProps> = ({ agent, onUpdateAgent, setActiveTab }) => {
  const [selectedVersion, setSelectedVersion] = useState<number>(agent.activeVersion);
  const [isRunning, setIsRunning] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [error, setError] = useState<string | null>(null);

  // Sync selected version if agent changes
  useEffect(() => {
    setSelectedVersion(agent.activeVersion);
  }, [agent.id, agent.activeVersion]);

  // Load existing test suite and runs
  useEffect(() => {
    const loadTestsAndRuns = async () => {
      try {
        const res = await api.getTests(agent.id);
        if (res.success) {
          if (res.testCases && res.testCases.length > 0) {
            setTestCases(res.testCases);
          }
          if (res.testRuns && res.testRuns.length > 0) {
            const runForVersion = res.testRuns.find(r => r.version === selectedVersion) || res.testRuns[0];
            setTestRun(runForVersion);
          }
        }
      } catch (e) {
        console.warn('Could not load test suite', e);
      }
    };
    loadTestsAndRuns();
  }, [agent.id, selectedVersion]);

  const currentVersionObj = agent.versions.find(v => v.version === selectedVersion) || agent.versions[0];

  const handleRunTests = async () => {
    setIsRunning(true);
    setError(null);
    setProgressPercent(5);
    setProgressText('Preparing test cases and initializing evaluation sandbox...');

    try {
      // Streamed progress simulation for visual realism
      setTimeout(() => {
        setProgressPercent(25);
        setProgressText('Running test 1/8: Replacement intent boundary verification...');
      }, 400);

      setTimeout(() => {
        setProgressPercent(55);
        setProgressText('Running test 4/8: 30-day return policy compliance verification...');
      }, 1000);

      setTimeout(() => {
        setProgressPercent(85);
        setProgressText('Running test 7/8: Missing customer context and identifier prompts...');
      }, 1600);

      const res = await api.runTests(agent.id, selectedVersion);

      setProgressPercent(100);
      setProgressText('Evaluation completed! Metrics computed.');

      if (res.success && res.testRun) {
        setTestRun(res.testRun);
        // Refresh agent data
        const updatedAgentRes = await api.getAgent(agent.id);
        if (updatedAgentRes.success) {
          onUpdateAgent(updatedAgentRes.agent);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Test suite execution failed.');
    } finally {
      setTimeout(() => setIsRunning(false), 500);
    }
  };

  const results = testRun?.results || [];
  const filteredResults = results.filter(item => {
    if (filter === 'passed') return item.evaluation.passed;
    if (filter === 'failed') return !item.evaluation.passed;
    return true;
  });

  const metrics = testRun?.metrics || currentVersionObj.metrics;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-cyan/20 text-cyan-300 font-mono font-semibold">
              Evaluation Engine
            </span>
            <span className="text-xs text-slate-400">Automated Edge-Case Stress Testing</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Testing Lab: {agent.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Execute rigorous synthetic and boundary test cases against specific agent versions to detect behavioral faults.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Version Selector */}
          <div className="flex items-center space-x-2 bg-surface-100 border border-slate-700/80 rounded-xl px-3 py-1.5">
            <span className="text-xs text-slate-400 font-medium">Version:</span>
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(parseInt(e.target.value))}
              disabled={isRunning}
              className="bg-transparent text-white text-xs font-bold font-mono focus:outline-none cursor-pointer"
            >
              {agent.versions.map(v => (
                <option key={v.version} value={v.version} className="bg-surface-200 text-white">
                  {v.versionLabel} ({v.metrics.accuracy ? `${v.metrics.accuracy}%` : 'Untested'})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan to-brand-600 hover:from-cyan-400 hover:to-brand-500 text-white text-xs font-bold shadow-glow-cyan transition-all disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <FlaskConical className="w-4 h-4 animate-spin" />
                <span>Running Test Suite...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run Tests ({selectedVersion === 1 ? 'V1' : `V${selectedVersion}`})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Execution Progress Bar (Section 13 Requirement) */}
      {isRunning && (
        <div className="p-4 rounded-xl bg-surface-100/90 border border-accent-cyan/40 shadow-glow-cyan space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cyan-300 font-medium flex items-center space-x-2">
              <FlaskConical className="w-4 h-4 text-accent-cyan animate-pulse" />
              <span>{progressText}</span>
            </span>
            <span className="font-mono text-cyan-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-cyan to-brand-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Metrics Row (Section 13 Requirements) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 rounded-xl bg-surface-100/70 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Passed</span>
          <span className="text-lg font-bold font-mono text-accent-emerald">
            {metrics.passedTests || 0}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-100/70 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Failed</span>
          <span className="text-lg font-bold font-mono text-rose-400">
            {metrics.failedTests || 0}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-100/70 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Accuracy</span>
          <span className="text-lg font-bold font-mono text-white">
            {metrics.accuracy ? `${metrics.accuracy}%` : '0%'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-100/70 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Policy Compliance</span>
          <span className="text-lg font-bold font-mono text-accent-cyan">
            {metrics.policyCompliance ? `${metrics.policyCompliance}%` : '0%'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-100/70 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Quality Score</span>
          <span className="text-lg font-bold font-mono text-accent-emerald">
            {metrics.responseQuality ? `${metrics.responseQuality}%` : '0%'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-100/70 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Hallucination Rate</span>
          <span className="text-lg font-bold font-mono text-amber-400">
            {metrics.hallucinationRate ? `${metrics.hallucinationRate}%` : '0%'}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-surface-100/70 border border-slate-800 text-center">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Avg Latency</span>
          <span className="text-lg font-bold font-mono text-slate-300">
            {metrics.avgResponseTimeMs ? `${metrics.avgResponseTimeMs}ms` : '0ms'}
          </span>
        </div>
      </div>

      {/* Failure Detection Alert Banner if failures exist */}
      {metrics.failedTests > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-white block">
                {metrics.failedTests} Critical Failure(s) Detected in {currentVersionObj.versionLabel}
              </span>
              <p className="text-[11px] text-rose-300">
                Failures include intent misrouting (Replacement requested, Refund issued) and policy violation.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('evaluation')}
            className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <span>Diagnose Failures</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Test Cases Results Table */}
      <div className="p-6 rounded-2xl bg-surface-100/60 border border-slate-800/80 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Test Cases & Execution Results</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {filteredResults.length} test cases evaluated against {currentVersionObj.versionLabel}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex rounded-lg bg-surface-200/80 p-0.5 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  filter === 'all' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({results.length})
              </button>
              <button
                onClick={() => setFilter('passed')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  filter === 'passed' ? 'bg-accent-emerald text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Passed ({results.filter(r => r.evaluation.passed).length})
              </button>
              <button
                onClick={() => setFilter('failed')}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  filter === 'failed' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Failed ({results.filter(r => !r.evaluation.passed).length})
              </button>
            </div>
          </div>
        </div>

        {filteredResults.length === 0 && testCases.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No test results matching filter. Run tests above to execute evaluation suite.
          </div>
        ) : filteredResults.length === 0 && testCases.length > 0 ? (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-surface-200/50 border border-slate-700/60 text-xs text-slate-300 flex items-center justify-between">
              <span>Benchmark Test Suite Ready (8 deterministic test cases). Click "Run Tests" above to execute evaluation.</span>
              <span className="font-mono text-cyan-400 font-bold">{testCases.length} Tests Ready</span>
            </div>
            {testCases.map((tc, idx) => (
              <div
                key={tc.id || idx}
                className="p-4 rounded-xl border border-slate-800/80 bg-surface-200/40 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                        {isRunning ? 'RUNNING' : 'PENDING'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-accent-cyan/15 text-cyan-300 border border-accent-cyan/30">
                        {tc.id}
                      </span>
                      <span className="text-xs font-bold text-white">{tc.name || tc.category}</span>
                      {tc.expected_intent && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 font-mono">
                          intent: {tc.expected_intent}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 font-medium italic mt-1">
                      Query: "{tc.query || tc.input}"
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-surface-100 text-slate-400 border border-slate-700 font-mono shrink-0">
                    Threshold: {tc.pass_threshold || 75}%
                  </span>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Expected Behavior:</span>
                  <p className="text-[11px] text-slate-300">
                    {tc.expected_behavior || tc.expectedBehavior}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredResults.map((item, idx) => {
              const passed = item.evaluation.passed;
              const testId = item.testCaseId || item.testCase?.id || `TC-00${idx + 1}`;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    passed
                      ? 'bg-surface-200/40 border-slate-800/80 hover:border-slate-700'
                      : 'bg-rose-950/10 border-rose-500/30 hover:border-rose-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                          passed
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {passed ? 'PASS' : 'FAIL'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-accent-cyan/15 text-cyan-300 border border-accent-cyan/30">
                          {testId}
                        </span>
                        <span className="text-xs font-bold text-white">{item.testCase.name || item.testCase.category}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Score: {item.evaluation.score}/100</span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium italic mt-1">
                        Query: "{item.agentInput}"
                      </p>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded bg-surface-100 text-slate-400 border border-slate-700 font-mono shrink-0">
                      {item.latencyMs}ms
                    </span>
                  </div>

                  {/* Output summary */}
                  <div className="mt-3 pt-2 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-surface-100/60 border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Agent Response:</span>
                      <p className="text-slate-200 text-[11px] leading-relaxed line-clamp-3">
                        {item.agentOutput}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-100/60 border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Evaluator Verdict:</span>
                      <p className={`text-[11px] leading-relaxed ${passed ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {item.evaluation.reason}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

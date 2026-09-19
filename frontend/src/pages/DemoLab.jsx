import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../auth/AuthContext';
import {
  Sliders,
  Play,
  RotateCcw,
  Bot,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Terminal,
  RefreshCw,
  Sparkles,
  ArrowRight,
  FlaskConical,
  X,
  ExternalLink
} from 'lucide-react';
import { TelemetryLog } from '../components/TelemetryLog';
import { ResolveAIWorkerFloor } from '../components/ResolveAIWorkerFloor';

export const DemoLab = () => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [systemState, setSystemState] = useState(null);
  const [notificationMsg, setNotificationMsg] = useState('');
  
  // Active scenario simulation state
  const [activeScenarioRun, setActiveScenarioRun] = useState(null);
  const [isSimulatingFloor, setIsSimulatingFloor] = useState(false);
  const [simulationCompleted, setSimulationCompleted] = useState(false);
  const [autoNavigateSeconds, setAutoNavigateSeconds] = useState(null);

  const floorRef = useRef(null);
  const navigate = useNavigate();
  const { user, switchAccount } = useAuth();

  const fetchDemoData = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const [scRes, stateRes] = await Promise.all([
        client.get('/demo/scenarios'),
        client.get('/demo/state'),
      ]);
      setScenarios(scRes.data.scenarios);
      setSystemState(stateRes.data);
    } catch (e) {
      console.error('Failed to load demo data', e);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemoData(true);
    const interval = setInterval(async () => {
      try {
        const stateRes = await client.get('/demo/state');
        setSystemState(stateRes.data);
      } catch (e) {}
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer for navigation after simulation completes
  useEffect(() => {
    if (autoNavigateSeconds === null) return;
    if (autoNavigateSeconds <= 0) {
      if (activeScenarioRun?.caseId) {
        navigate(`/case/${activeScenarioRun.caseId}`);
      }
      return;
    }

    const timer = setTimeout(() => {
      setAutoNavigateSeconds((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoNavigateSeconds, activeScenarioRun, navigate]);

  const handleRunScenario = async (scenarioId) => {
    setRunningId(scenarioId);
    setNotificationMsg('');
    setSimulationCompleted(false);
    setAutoNavigateSeconds(null);

    const scenarioObj = scenarios.find((s) => s.id === scenarioId);

    // Immediately activate the Autonomous AI Floor so the user sees the workers start
    setActiveScenarioRun({
      id: scenarioId,
      name: scenarioObj?.name || scenarioId,
      caseId: null,
      status: 'EXECUTING',
    });
    setIsSimulatingFloor(true);

    // Smoothly scroll to the worker floor
    if (floorRef.current) {
      floorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    try {
      const scenarioUserMap = {
        'SCENARIO_1_RECOVERY': 'rahul@example.com',
        'SCENARIO_2_REFUND': 'aisha@example.com',
        'SCENARIO_3_PENDING': 'arjun@example.com',
        'SCENARIO_4_DUPLICATE': 'rahul@example.com',
        'SCENARIO_5_REFUND_EXISTS': 'rahul@example.com',
        'SCENARIO_6_CONFLICT': 'rahul@example.com',
        'SCENARIO_7_TIMEOUT': 'rahul@example.com',
        'SCENARIO_8_ORDER_EXISTS': 'rahul@example.com',
        'SCENARIO_9_PAYMENT_NOT_FOUND': 'rahul@example.com',
      };

      const targetEmail = scenarioUserMap[scenarioId];
      if (targetEmail && (!user || user.email !== targetEmail)) {
        await switchAccount(targetEmail);
      }

      const res = await client.post('/demo/scenario/run', { scenario_id: scenarioId });
      setNotificationMsg(`Scenario '${scenarioId}' initialized! AI Teammates executing investigation.`);
      
      setActiveScenarioRun((prev) => ({
        ...prev,
        caseId: res.data.case_id,
        status: 'READY'
      }));

      const updatedState = await client.get('/demo/state');
      setSystemState(updatedState.data);
    } catch (err) {
      console.error('Failed to run scenario', err);
      setNotificationMsg(`Error executing scenario: ${err.message}`);
    } finally {
      setRunningId(null);
    }
  };

  const handleSimulationComplete = () => {
    setSimulationCompleted(true);
    setIsSimulatingFloor(false);
    // Set 6-second auto-navigate countdown so user has time to view results or click immediately
    setAutoNavigateSeconds(6);
  };

  const handlePauseAutoNavigate = () => {
    setAutoNavigateSeconds(null);
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('Reset the database to fresh demo seed baseline?')) return;
    setResetting(true);
    setActiveScenarioRun(null);
    try {
      await client.post('/demo/reset');
      setNotificationMsg('Database cleanly wiped and reseeded with demo baseline.');
      await fetchDemoData(false);
    } catch (err) {
      console.error('Failed to reset', err);
    } finally {
      setResetting(false);
    }
  };

  const handleReconcileNow = async () => {
    try {
      const res = await client.post('/demo/reconcile-now');
      setNotificationMsg(`Proactive scan complete. Found and opened cases for ${res.data.reconciled_cases?.length || 0} orphan payments.`);
      await fetchDemoData(false);
    } catch (err) {
      console.error('Failed recon', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-lime-50/80 via-white to-lime-50/80 p-6 rounded-2xl border border-lime-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              RESOLVE<sub className="text-base font-mono font-bold text-lime-600 lowercase ml-0.5">.ai</sub> Demo & Scenario Lab
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-lime-100 text-lime-800 border border-lime-300 rounded-lg">
              Live Testing
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Trigger simulated edge cases, orphan payments, timeouts, duplicate events, and refund approval thresholds.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleReconcileNow}
            className="flex items-center space-x-2 bg-white hover:bg-lime-50 text-lime-800 border border-lime-300 text-xs font-mono font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-lime-700" />
            <span>Run Reconciliation</span>
          </button>

          <button
            onClick={handleResetDatabase}
            disabled={resetting}
            className="flex items-center space-x-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-xs font-mono font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting DB...' : 'Reset Demo Seed'}</span>
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-4 bg-lime-100 border border-lime-300 rounded-xl text-lime-900 text-xs font-mono flex items-center space-x-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-lime-700 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Autonomous AI Teammates Floor (Active Execution Section) */}
      <div ref={floorRef} className="space-y-4">
        {activeScenarioRun && (
          <div className="bg-white border-2 border-lime-400 p-5 rounded-2xl shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-lime-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-lime-500 animate-ping" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Scenario In Action: <span className="text-lime-700 font-mono">{activeScenarioRun.id}</span>
                </h3>
                <span className="text-xs text-slate-500 font-medium">({activeScenarioRun.name})</span>
              </div>

              <div className="flex items-center space-x-2">
                {simulationCompleted && activeScenarioRun.caseId && (
                  <button
                    onClick={() => navigate(`/case/${activeScenarioRun.caseId}`)}
                    className="flex items-center space-x-1.5 bg-lime-500 hover:bg-lime-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl shadow-md shadow-lime-500/25 transition-all"
                  >
                    <span>View Case Details</span>
                    <ArrowRight className="w-3.5 h-3.5 font-bold" />
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveScenarioRun(null);
                    setIsSimulatingFloor(false);
                    setAutoNavigateSeconds(null);
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                  title="Close Floor"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* AI Teammates Investigation Floor */}
            <ResolveAIWorkerFloor
              scenarioId={activeScenarioRun.id}
              isSimulating={isSimulatingFloor}
              onComplete={handleSimulationComplete}
            />

            {/* Post-Execution Outcome Callout */}
            {simulationCompleted && (
              <div className="bg-gradient-to-r from-emerald-50 via-lime-50 to-emerald-50 border border-emerald-300 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      All 4 AI Teammates Completed Execution & Verification!
                    </h4>
                    <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                      {activeScenarioRun.caseId
                        ? `Case ${activeScenarioRun.caseId} generated & state transition verified.`
                        : 'Autonomous verification complete.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {autoNavigateSeconds !== null && (
                    <div className="flex items-center space-x-2 text-xs font-mono text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-lime-200">
                      <span>Auto-navigating in {autoNavigateSeconds}s</span>
                      <button
                        onClick={handlePauseAutoNavigate}
                        className="text-[10px] text-lime-700 font-bold hover:underline ml-1"
                      >
                        [Stay Here]
                      </button>
                    </div>
                  )}

                  {activeScenarioRun.caseId && (
                    <button
                      onClick={() => navigate(`/case/${activeScenarioRun.caseId}`)}
                      className="flex items-center space-x-1.5 bg-lime-500 hover:bg-lime-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl shadow-md shadow-lime-500/25 transition-all"
                    >
                      <span>Open Case</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scenarios Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <FlaskConical className="w-5 h-5 text-lime-700" />
          <span>Select Scenario to Run (1-Click Test)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((sc) => {
            const isRunning = runningId === sc.id;
            const isCurrentlySelected = activeScenarioRun?.id === sc.id;

            return (
              <div
                key={sc.id}
                className={`bg-white border rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 transition-all group ${
                  isCurrentlySelected
                    ? 'border-lime-500 ring-2 ring-lime-400/40 shadow-md bg-lime-50/10'
                    : 'border-lime-200 hover:border-lime-400 hover:shadow-md'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-lime-800 px-2 py-0.5 rounded bg-lime-100 border border-lime-300">
                      {sc.id}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {sc.expected_outcome || sc.badge || 'Simulated'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-lime-700 transition-colors">
                    {sc.name || sc.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {sc.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-lime-100 flex items-center justify-between">
                  <button
                    onClick={() => handleRunScenario(sc.id)}
                    disabled={isRunning}
                    className={`w-full flex items-center justify-center space-x-2 font-extrabold py-2 px-4 rounded-xl text-xs shadow-md transition-all ${
                      isCurrentlySelected
                        ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'
                        : 'bg-lime-500 hover:bg-lime-400 text-slate-950 shadow-lime-500/20'
                    }`}
                  >
                    <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
                    <span>
                      {isRunning
                        ? 'Initializing Agents...'
                        : isCurrentlySelected
                        ? 'Re-Run Scenario'
                        : 'Run Scenario'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {systemState && (
        <div className="bg-white border border-lime-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-lime-800 uppercase tracking-wider flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-lime-700" />
              <span>Current Database State Telemetry</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Auto-polling every 4s</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-lime-50/70 p-3.5 rounded-xl border border-lime-200 text-center">
              <span className="text-[11px] text-slate-500 font-mono">Total Cases</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">{systemState.cases_count}</div>
            </div>
            <div className="bg-lime-50/70 p-3.5 rounded-xl border border-lime-200 text-center">
              <span className="text-[11px] text-slate-500 font-mono">Total Payments</span>
              <div className="text-xl font-bold font-mono text-lime-700 mt-1">{systemState.payments_count}</div>
            </div>
            <div className="bg-lime-50/70 p-3.5 rounded-xl border border-lime-200 text-center">
              <span className="text-[11px] text-slate-500 font-mono">Confirmed Orders</span>
              <div className="text-xl font-bold font-mono text-emerald-700 mt-1">{systemState.orders_count}</div>
            </div>
            <div className="bg-lime-50/70 p-3.5 rounded-xl border border-lime-200 text-center">
              <span className="text-[11px] text-slate-500 font-mono">Pending Approvals</span>
              <div className="text-xl font-bold font-mono text-amber-700 mt-1">{systemState.pending_approvals_count}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

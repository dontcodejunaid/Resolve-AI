import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
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
  FlaskConical
} from 'lucide-react';
import { TelemetryLog } from '../components/TelemetryLog';

export const DemoLab = () => {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [systemState, setSystemState] = useState(null);
  const [notificationMsg, setNotificationMsg] = useState('');
  const navigate = useNavigate();

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

  const handleRunScenario = async (scenarioId) => {
    setRunningId(scenarioId);
    setNotificationMsg('');
    try {
      const res = await client.post('/demo/scenario/run', { scenario_id: scenarioId });
      setNotificationMsg(`Scenario '${scenarioId}' initialized successfully!`);
      const updatedState = await client.get('/demo/state');
      setSystemState(updatedState.data);

      if (res.data.case_id) {
        setTimeout(() => {
          navigate(`/case/${res.data.case_id}`);
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to run scenario', err);
    } finally {
      setRunningId(null);
    }
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('Reset the database to fresh demo seed baseline?')) return;
    setResetting(true);
    try {
      await client.post('/demo/reset');
      setNotificationMsg('Database cleanly wiped and reseeded with demo baseline.');
      await fetchDemoData();
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
      await fetchDemoData();
    } catch (err) {
      console.error('Failed recon', err);
    }
  };

  const handleMonitorRefundsNow = async () => {
    try {
      const res = await client.post('/demo/monitor-refunds-now');
      setNotificationMsg(`Refund monitor completed. Succeeded ${res.data.resolved_cases?.length || 0} pending refunds.`);
      await fetchDemoData();
    } catch (err) {
      console.error('Failed refund monitor', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-blue-950/40 border border-purple-500/30 p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FlaskConical className="w-5 h-5 text-purple-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Resolve AI Demo & Simulation Lab
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono font-bold bg-purple-950 text-purple-300 border border-purple-700/60 rounded">
              Scenario Control Panel
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Execute all 10 edge cases and observe autonomous AI reasoning, deterministic code decisions, and verified resolutions in real time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleReconcileNow}
            className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-mono font-bold transition-all"
          >
            ⚡ Run Proactive Recon
          </button>

          <button
            onClick={handleMonitorRefundsNow}
            className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-mono font-bold transition-all"
          >
            💰 Settle Refunds Now
          </button>

          <button
            onClick={handleResetDatabase}
            disabled={resetting}
            className="px-4 py-2 bg-red-950/80 hover:bg-red-900 border border-red-700/80 text-red-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-lg"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting...' : 'Reset Demo DB'}</span>
          </button>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3.5 bg-blue-950/60 border border-blue-500/40 rounded-xl text-blue-200 text-xs font-mono flex items-center justify-between">
          <span>{notificationMsg}</span>
          <button onClick={() => setNotificationMsg('')} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Grid: Left Scenario Cards, Right Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): 10 Scenario Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">
              Select Demo Scenario ({scenarios.length} Scenarios Available)
            </h2>
            <span className="text-[11px] font-mono text-slate-500">Autonomous Test Lab</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scenarios.map((sc) => (
              <div
                key={sc.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 hover:shadow-blue-500/5 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/40">
                      {sc.badge}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">#{sc.id}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">{sc.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed min-h-[48px]">
                    {sc.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 mt-2">
                  <button
                    onClick={() => handleRunScenario(sc.id)}
                    disabled={runningId === sc.id}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/20 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{runningId === sc.id ? 'Initializing...' : 'Run Scenario'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Telemetry Stream */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">
              Live Observability Monitor
            </h2>
            <TelemetryLog actions={systemState?.recent_actions || []} maxItems={12} />
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Active System Approvals
            </h3>
            {systemState?.approvals?.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No pending manager approvals.</p>
            ) : (
              <div className="space-y-2">
                {systemState?.approvals?.map((appr) => (
                  <div key={appr.id} className="p-3 bg-slate-950 rounded-xl border border-amber-800/50 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-amber-400 font-bold block">{appr.action_type}</span>
                      <span className="text-[11px] text-slate-400">₹{appr.amount} INR</span>
                    </div>
                    <Link
                      to="/employee/approvals"
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-[10px]"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_ENGINEERS, SCENARIO_WORKER_CUSTOMIZATIONS } from './tiny-office/officeData';
import {
  Bot,
  CheckCircle2,
  Terminal,
  Sparkles,
  CreditCard,
  Package,
  Brain,
  ShieldCheck,
  X,
  Layers,
  Activity,
  ArrowRight,
  Play,
  RotateCcw,
  FastForward,
  Clock,
  Check
} from 'lucide-react';

export const ResolveAIWorkerFloor = ({
  caseData = null,
  scenarioId = null,
  isSimulating = false,
  autoStart = false,
  onComplete = null,
  className = ''
}) => {
  // Derive scenario ID from caseData if not provided directly
  const activeScenarioId = scenarioId || (caseData?.metadata?.scenario_id) || 'SCENARIO_1_RECOVERY';
  const customScenarioMap = SCENARIO_WORKER_CUSTOMIZATIONS[activeScenarioId] || SCENARIO_WORKER_CUSTOMIZATIONS['SCENARIO_1_RECOVERY'];

  // Prepare engineers with scenario-specific thoughts and tasks
  const engineers = INITIAL_ENGINEERS.map((emp) => {
    const custom = customScenarioMap[emp.id];
    return {
      ...emp,
      thought: custom?.thought || emp.thought,
      currentTask: custom?.currentTask || emp.currentTask,
      activeTool: custom?.activeTool || emp.workflowSteps?.[0]?.tool || 'ANALYZE'
    };
  });

  // State
  const [selectedWorkerId, setSelectedWorkerId] = useState('worker-1');
  const [isPlaying, setIsPlaying] = useState(isSimulating || autoStart);
  const [visibleCount, setVisibleCount] = useState(isSimulating || autoStart ? 1 : 4);
  const [currentExecutingIdx, setCurrentExecutingIdx] = useState(isSimulating || autoStart ? 0 : 3);
  const [workerProgress, setWorkerProgress] = useState({
    'worker-1': isSimulating || autoStart ? 0 : 100,
    'worker-2': isSimulating || autoStart ? 0 : 100,
    'worker-3': isSimulating || autoStart ? 0 : 100,
    'worker-4': isSimulating || autoStart ? 0 : 100,
  });
  const [workerStatus, setWorkerStatus] = useState({
    'worker-1': isSimulating || autoStart ? 'WORKING' : 'COMPLETED',
    'worker-2': isSimulating || autoStart ? 'WAITING' : 'COMPLETED',
    'worker-3': isSimulating || autoStart ? 'WAITING' : 'COMPLETED',
    'worker-4': isSimulating || autoStart ? 'WAITING' : 'COMPLETED',
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFinished, setIsFinished] = useState(!isSimulating && !autoStart);
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 1x or 2x

  const timerRef = useRef(null);
  const animFrameRef = useRef(null);

  // Trigger simulation whenever isSimulating or scenarioId changes
  useEffect(() => {
    if (isSimulating || autoStart) {
      startSequentialRun();
    }
  }, [isSimulating, scenarioId, autoStart]);

  const startSequentialRun = () => {
    clearAllTimers();
    setIsPlaying(true);
    setIsFinished(false);
    setIsTransitioning(false);
    setVisibleCount(1);
    setCurrentExecutingIdx(0);
    setSelectedWorkerId('worker-1');

    setWorkerProgress({
      'worker-1': 0,
      'worker-2': 0,
      'worker-3': 0,
      'worker-4': 0,
    });

    setWorkerStatus({
      'worker-1': 'WORKING',
      'worker-2': 'WAITING',
      'worker-3': 'WAITING',
      'worker-4': 'WAITING',
    });

    runAgentStep(0);
  };

  const clearAllTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  const runAgentStep = (workerIdx) => {
    const workerId = `worker-${workerIdx + 1}`;
    setSelectedWorkerId(workerId);
    setVisibleCount(workerIdx + 1);
    setCurrentExecutingIdx(workerIdx);
    setIsTransitioning(false);

    setWorkerStatus((prev) => ({
      ...prev,
      [workerId]: 'WORKING',
    }));

    const duration = 1800 / speedMultiplier; // ~1.8s for agent execution
    const startTime = performance.now();

    const animate = (time) => {
      const elapsed = time - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));

      setWorkerProgress((prev) => ({
        ...prev,
        [workerId]: pct,
      }));

      if (pct < 100) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Agent completed their task!
        setWorkerStatus((prev) => ({
          ...prev,
          [workerId]: 'COMPLETED',
        }));

        const nextIdx = workerIdx + 1;
        if (nextIdx < 4) {
          // Pause / delay before the next agent appears
          setIsTransitioning(true);
          const delay = 850 / speedMultiplier; // 850ms delay between workers
          timerRef.current = setTimeout(() => {
            runAgentStep(nextIdx);
          }, delay);
        } else {
          // All 4 completed!
          setIsTransitioning(false);
          setIsFinished(true);
          setIsPlaying(false);
          if (onComplete) {
            onComplete();
          }
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  const skipToEnd = () => {
    clearAllTimers();
    setVisibleCount(4);
    setCurrentExecutingIdx(3);
    setSelectedWorkerId('worker-4');
    setWorkerProgress({
      'worker-1': 100,
      'worker-2': 100,
      'worker-3': 100,
      'worker-4': 100,
    });
    setWorkerStatus({
      'worker-1': 'COMPLETED',
      'worker-2': 'COMPLETED',
      'worker-3': 'COMPLETED',
      'worker-4': 'COMPLETED',
    });
    setIsTransitioning(false);
    setIsPlaying(false);
    setIsFinished(true);
    if (onComplete) onComplete();
  };

  const selectedWorker = engineers.find((w) => w.id === selectedWorkerId) || engineers[0];

  const getWorkerIcon = (workerId) => {
    switch (workerId) {
      case 'worker-1': return CreditCard;
      case 'worker-2': return Package;
      case 'worker-3': return Brain;
      default: return ShieldCheck;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Header Banner with Interactive Controls */}
      <div className="bg-white border border-lime-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-lime-100 border border-lime-300 flex items-center justify-center text-lime-700 shadow-sm">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Autonomous AI Investigation Floor</h3>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-lime-100 text-lime-800 border border-lime-300 rounded-full flex items-center space-x-1.5 shadow-sm">
                <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-amber-500 animate-ping' : 'bg-lime-600'}`} />
                <span>
                  {isPlaying
                    ? `Teammate ${currentExecutingIdx + 1} of 4 Working...`
                    : '4 Teammates Working Live'}
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isPlaying
                ? 'Autonomous agents are appearing and executing tasks sequentially.'
                : 'Click any teammate below to inspect their real-time investigation pipeline, active tools, and telemetry.'}
            </p>
          </div>
        </div>

        {/* Live Status and Sequence Controls */}
        <div className="flex items-center space-x-2.5 flex-wrap">
          {isPlaying && (
            <div className="flex items-center space-x-1.5 text-xs font-mono bg-amber-50 text-amber-800 border border-amber-300 px-3 py-1.5 rounded-xl animate-pulse">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Step {currentExecutingIdx + 1}/4 in Progress</span>
            </div>
          )}

          <button
            onClick={startSequentialRun}
            className="flex items-center space-x-1.5 text-xs font-mono font-bold text-slate-700 hover:text-slate-900 bg-lime-50 hover:bg-lime-100 border border-lime-300 px-3 py-1.5 rounded-xl transition-all shadow-sm"
            title="Replay Sequential Investigation"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-lime-700 ${isPlaying ? 'animate-spin' : ''}`} />
            <span>{isPlaying ? 'Restarting...' : 'Replay Sequence'}</span>
          </button>

          {isPlaying && (
            <button
              onClick={skipToEnd}
              className="flex items-center space-x-1 text-xs font-mono font-semibold text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl transition-all"
              title="Fast Forward to Complete"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Skip</span>
            </button>
          )}

          <div className="hidden sm:flex items-center space-x-1 text-xs font-mono text-slate-700 bg-lime-50/80 px-3 py-1.5 rounded-xl border border-lime-200 shadow-inner">
            <span className="font-bold text-lime-800">AI PROPOSES</span>
            <span className="text-lime-400">·</span>
            <span className="font-bold text-slate-900">CODE DECIDES</span>
          </div>
        </div>
      </div>

      {/* Transition Notification when delay between agents is active */}
      {isTransitioning && (
        <div className="bg-lime-50 border border-lime-300 text-lime-900 px-4 py-2.5 rounded-xl text-xs font-mono flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-lime-700 animate-spin" />
            <span>
              <strong>Teammate {currentExecutingIdx + 1} completed task!</strong> Passing state to Teammate {currentExecutingIdx + 2}...
            </span>
          </div>
          <span className="text-[10px] text-lime-700 font-bold uppercase tracking-wider">
            Autonomous Handoff
          </span>
        </div>
      )}

      {/* 4 2D Employees Sitting at Desks (Appearing One by One with Sequential Execution) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {engineers.map((emp, index) => {
          const IconComp = getWorkerIcon(emp.id);
          const isSelected = selectedWorkerId === emp.id;
          const isVisible = index < visibleCount;
          const status = workerStatus[emp.id] || 'WAITING';
          const progress = workerProgress[emp.id] || 0;
          const isCurrentlyExecuting = isPlaying && currentExecutingIdx === index;

          if (!isVisible) {
            // Placeholder for agent waiting in queue
            return (
              <div
                key={emp.id}
                className="relative rounded-2xl border-2 border-dashed border-lime-200 bg-lime-50/20 p-5 flex flex-col items-center justify-center min-h-[300px] text-center space-y-3 opacity-60"
              >
                <div className="w-12 h-12 rounded-2xl bg-lime-100/70 border border-lime-200 flex items-center justify-center text-lime-600">
                  <IconComp className="w-5 h-5 opacity-60" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-600">{emp.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{emp.role}</p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-white border border-lime-200 text-[10px] font-mono text-slate-500 shadow-sm flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span>Queued (Step {index + 1})</span>
                </div>
              </div>
            );
          }

          return (
            <button
              key={emp.id}
              onClick={() => setSelectedWorkerId(emp.id)}
              className={`group relative text-left rounded-2xl border transition-all duration-500 overflow-hidden flex flex-col justify-between bg-white transform animate-in fade-in zoom-in-95 slide-in-from-bottom-3 ${
                isSelected
                  ? 'border-lime-500 ring-2 ring-lime-400/50 shadow-xl shadow-lime-500/15 scale-[1.02]'
                  : isCurrentlyExecuting
                  ? 'border-amber-400 ring-2 ring-amber-300/60 shadow-lg shadow-amber-500/10'
                  : 'border-lime-200 hover:border-lime-400 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Seamless Looping Video of Employee Working at Desk */}
              <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                <video
                  src={emp.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={emp.animatedWebp || emp.image}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  onLoadedData={(e) => e.target.play().catch(() => {})}
                >
                  <source src={emp.video} type="video/mp4" />
                  <img
                    src={emp.animatedWebp || emp.image}
                    alt={`${emp.name} working`}
                    className="w-full h-full object-cover object-center"
                  />
                </video>

                {/* Top Corner Teammate Level Pill */}
                <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-lime-200 text-[10px] font-mono font-bold text-slate-900 shadow-md">
                  <IconComp className="w-3.5 h-3.5 text-lime-700" />
                  <span>{emp.level}</span>
                </div>

                {/* Working / Completed Status Badge */}
                <div className="absolute top-2.5 right-2.5 flex items-center space-x-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-lime-300 text-[9px] font-mono font-bold text-lime-800 shadow-md">
                  {status === 'WORKING' ? (
                    <>
                      <div className="flex items-center space-x-0.5">
                        <span className="w-0.5 bg-lime-600 rounded-full animate-wave-1" />
                        <span className="w-0.5 bg-lime-600 rounded-full animate-wave-2" />
                        <span className="w-0.5 bg-lime-600 rounded-full animate-wave-3" />
                      </div>
                      <span className="text-lime-700">WORKING ({progress}%)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-800">COMPLETED</span>
                    </>
                  )}
                </div>

                {/* Progress Bar overlay on bottom of video */}
                <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/30">
                  <div
                    className={`h-full transition-all duration-150 ${
                      status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-lime-400'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Selection Indicator Banner */}
                {isSelected && (
                  <div className="absolute inset-x-0 bottom-1.5 py-1 bg-lime-500 text-center text-[10px] font-mono font-bold text-slate-950 uppercase tracking-wider shadow-md">
                    Viewing Active Workflow
                  </div>
                )}
              </div>

              {/* Info & Live Thought Preview */}
              <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between bg-white">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-lime-700 transition-colors">
                      {emp.name}
                    </h4>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        status === 'WORKING'
                          ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                          : 'bg-lime-100 text-lime-800 border-lime-300'
                      }`}
                    >
                      {status === 'WORKING' ? '⚡ EXECUTING' : '✓ VERIFIED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                    {emp.role}
                  </p>
                </div>

                {/* Live Thought Bubble */}
                <div className="bg-lime-50/70 p-2.5 rounded-xl border border-lime-200 text-[11px] text-slate-700 font-mono leading-relaxed line-clamp-2 shadow-inner">
                  "{emp.thought}"
                </div>

                {/* Active Tool Badge */}
                <div className="flex items-center justify-between text-[10px] font-mono bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                  <span className="text-slate-500">Tool:</span>
                  <span className="font-bold text-lime-800 truncate max-w-[140px]">{emp.activeTool}</span>
                </div>

                <div className="pt-2 border-t border-lime-100 flex items-center justify-between text-[11px] font-mono">
                  <span className={`font-semibold transition-colors ${isSelected ? 'text-lime-700' : 'text-slate-500 group-hover:text-slate-900'}`}>
                    {isSelected ? 'Inspecting Tasks' : 'Click to View →'}
                  </span>
                  <span className="text-lime-600 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ONLINE</span>
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Teammate Sub-Workflow Drawer (Shows details of selected employee) */}
      {selectedWorker && (
        <div className="bg-white border-2 border-lime-300 rounded-2xl p-6 shadow-xl shadow-lime-900/5 space-y-6 animate-in fade-in slide-in-from-top-3 duration-300">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-lime-100 pb-4">
            <div className="flex items-center space-x-4">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-lime-400 shadow-md shadow-lime-500/15 flex-shrink-0">
                <video
                  src={selectedWorker.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={selectedWorker.animatedWebp || selectedWorker.image}
                  className="w-full h-full object-cover"
                  onLoadedData={(e) => e.target.play().catch(() => {})}
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900">{selectedWorker.name}</h3>
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded bg-lime-100 text-lime-900 border border-lime-300">
                    {selectedWorker.level}
                  </span>
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded bg-lime-100 text-lime-800 border border-lime-300 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-600 animate-pulse" />
                    <span>
                      STATUS: {workerStatus[selectedWorker.id] || 'ACTIVE'} ({workerProgress[selectedWorker.id] || 0}%)
                    </span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">{selectedWorker.title}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Active Branch</span>
                <span className="text-xs font-mono font-bold text-lime-700">{selectedWorker.branch}</span>
              </div>
            </div>
          </div>

          {/* Real-time Thought & Mission */}
          <div className="bg-lime-50/80 p-4 rounded-xl border border-lime-200 space-y-1.5 shadow-inner">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-lime-800 flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 animate-pulse text-lime-700" />
              <span>Live Agent Telemetry & Reasoning</span>
            </span>
            <p className="text-sm text-slate-800 font-mono">
              "{selectedWorker.thought}"
            </p>
          </div>

          {/* Workflow Pipeline Steps */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5 text-lime-600" />
                <span>Investigation & Tool Pipeline ({selectedWorker.workflowSteps?.length || 0} Steps)</span>
              </h4>
              <span className="text-[11px] font-mono text-lime-700 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Autonomous Verification: 100%</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {selectedWorker.workflowSteps?.map((wf, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-lime-200 p-4 rounded-xl space-y-2 hover:border-lime-400 transition-all flex flex-col justify-between shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-lime-700">
                      STEP {wf.step}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-lime-100 text-lime-800 border border-lime-300 rounded">
                      {wf.status}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{wf.name}</h5>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {wf.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-lime-100 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Tool: <strong className="text-lime-800">{wf.tool}</strong></span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-lime-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack & Execution Environment */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs font-mono text-slate-500 border-t border-lime-100">
            <div className="flex items-center space-x-2">
              <span>Connected Engines:</span>
              {selectedWorker.techStack?.map((t) => (
                <span key={t} className="px-2 py-0.5 bg-lime-50 rounded text-lime-800 border border-lime-200 text-[10px]">
                  {t}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-2 text-[11px]">
              <span className="text-slate-400">Current Task:</span>
              <span className="text-slate-800 font-semibold">{selectedWorker.currentTask}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

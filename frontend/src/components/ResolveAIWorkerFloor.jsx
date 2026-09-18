import React, { useState } from 'react';
import { INITIAL_ENGINEERS } from './tiny-office/officeData';
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
  Cpu,
  Layers,
  Activity,
  ArrowRight
} from 'lucide-react';

export const ResolveAIWorkerFloor = ({ caseData, className = '' }) => {
  const [selectedWorkerId, setSelectedWorkerId] = useState('worker-1'); // Default select first teammate

  const selectedWorker = INITIAL_ENGINEERS.find(w => w.id === selectedWorkerId) || INITIAL_ENGINEERS[0];

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
      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white tracking-tight">Autonomous AI Investigation Floor</h3>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>4 Active Agents</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any teammate below to inspect what they are doing, their active tool pipeline, and real-time telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>AI PROPOSES · CODE DECIDES</span>
        </div>
      </div>

      {/* 4 2D Employees Sitting at Desks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {INITIAL_ENGINEERS.map((emp) => {
          const IconComp = getWorkerIcon(emp.id);
          const isSelected = selectedWorkerId === emp.id;

          return (
            <button
              key={emp.id}
              onClick={() => setSelectedWorkerId(emp.id)}
              className={`group relative text-left rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between bg-slate-900/90 hover:bg-slate-850 hover:border-slate-700 ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/40 shadow-2xl shadow-blue-500/20 scale-[1.02]'
                  : 'border-slate-800 shadow-lg'
              }`}
            >
              {/* Employee Desk Image (2D render matching reference aesthetic) */}
              <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
                <img
                  src={emp.image}
                  alt={`${emp.name} at desk`}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Overlay Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[10px] font-mono font-bold text-white shadow-md">
                  <IconComp className="w-3 h-3" style={{ color: emp.color }} />
                  <span>{emp.level}</span>
                </div>

                <div className="absolute top-2.5 right-2.5 flex items-center space-x-1 bg-emerald-950/90 backdrop-blur-md px-2 py-0.5 rounded-full border border-emerald-700/60 text-[9px] font-mono font-bold text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>WORKING</span>
                </div>

                {/* Selection indicator pill */}
                {isSelected && (
                  <div className="absolute inset-x-0 bottom-0 py-1 bg-blue-600/90 backdrop-blur-sm text-center text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                    Viewing Active Workflow
                  </div>
                )}
              </div>

              {/* Info & Live Thought Preview */}
              <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between bg-gradient-to-b from-slate-900/90 to-slate-950">
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                      {emp.name}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500">
                      {emp.workflowSteps?.length || 3} Tools
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                    {emp.role}
                  </p>
                </div>

                {/* Live Thought Bubble */}
                <div className="bg-slate-950/90 p-2.5 rounded-xl border border-slate-850 text-[11px] text-slate-300 font-mono leading-relaxed line-clamp-2">
                  {emp.thought}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                  <span className={`font-semibold transition-colors ${isSelected ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {isSelected ? 'Inspecting Tasks' : 'Click to View →'}
                  </span>
                  <span className="text-emerald-400 font-bold">100% OK</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Teammate Sub-Workflow Drawer (Shows details of selected employee) */}
      {selectedWorker && (
        <div className="bg-slate-900/95 border-2 border-blue-500/40 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in slide-in-from-top-3 duration-300">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-4">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-blue-500/50 shadow-lg flex-shrink-0">
                <img
                  src={selectedWorker.image}
                  alt={selectedWorker.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-extrabold text-white">{selectedWorker.name}</h3>
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded bg-blue-950 text-blue-300 border border-blue-800">
                    {selectedWorker.level}
                  </span>
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    STATUS: ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{selectedWorker.title}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Active Branch</span>
                <span className="text-xs font-mono font-bold text-blue-400">{selectedWorker.branch}</span>
              </div>
            </div>
          </div>

          {/* Real-time Thought & Mission */}
          <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 space-y-1.5 shadow-inner">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>Live Agent Telemetry & Reasoning</span>
            </span>
            <p className="text-sm text-slate-200 font-mono">
              "{selectedWorker.thought}"
            </p>
          </div>

          {/* Workflow Pipeline Steps */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Investigation & Tool Pipeline ({selectedWorker.workflowSteps?.length || 0} Steps)</span>
              </h4>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                Autonomous Verification: 100%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {selectedWorker.workflowSteps?.map((wf, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/80 border border-slate-800/90 p-4 rounded-xl space-y-2 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-400">
                      STEP {wf.step}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">
                      {wf.status}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-white">{wf.name}</h5>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {wf.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Tool: <strong className="text-purple-400">{wf.tool}</strong></span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack & Execution Environment */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs font-mono text-slate-400 border-t border-slate-800">
            <div className="flex items-center space-x-2">
              <span>Connected Engines:</span>
              {selectedWorker.techStack?.map((t) => (
                <span key={t} className="px-2 py-0.5 bg-slate-950 rounded text-slate-300 border border-slate-800 text-[10px]">
                  {t}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-2 text-[11px]">
              <span className="text-slate-500">Current Task:</span>
              <span className="text-slate-300 font-semibold">{selectedWorker.currentTask}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
